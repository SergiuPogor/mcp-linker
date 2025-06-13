use serde_json::{json, Value};
use std::io::ErrorKind;
use std::path::Path;
use tokio::fs;
use tokio::task;

pub struct JsonManager;

impl JsonManager {
    // Normalize response key to mcpServers for consistent client API
    fn normalize_response_key(mut json: Value, client: &str) -> Result<Value, String> {
        if client == "vscode" && json.is_object() {
            let servers_key = "servers";
            let mcp_servers_key = "mcpServers";

            // If json has "servers" key but not "mcpServers"
            if json.as_object().unwrap().contains_key(servers_key)
                && !json.as_object().unwrap().contains_key(mcp_servers_key)
            {
                // Clone the content from servers to mcpServers
                let servers_value = json[servers_key].clone();
                json[mcp_servers_key] = servers_value;
            }
        }

        Ok(json)
    }

    pub async fn read_json_file(path: &Path) -> Result<Value, String> {
        let path_buf = path.to_path_buf();
        let content_result = fs::read_to_string(&path_buf).await;

        match content_result {
            Ok(content) => {
                task::spawn_blocking(move || {
                    serde_json::from_str(&content).map_err(|e| format!("Failed to parse JSON: {}", e))
                })
                .await
                .map_err(|e| format!("Failed to run blocking task for JSON parsing: {}", e))?
            },
            Err(e) => {
                if e.kind() == ErrorKind::NotFound {
                    Ok(json!({})) // Return empty JSON for Not Found
                } else {
                    Err(format!("Failed to read file: {}", e))
                }
            }
        }
    }

    pub async fn write_json_file(path: &Path, content: &Value) -> Result<(), String> {
        let path_buf = path.to_path_buf();
        let content_cloned = content.clone(); // Clone for the blocking task

        // Ensure directory exists
        if let Some(parent) = path_buf.parent() {
            if !parent.exists() {
                fs::create_dir_all(parent).await.map_err(|e| {
                    format!("Failed to create directory: {}", e)
                })?;
            }
        }

        // Serialize JSON in a blocking task
        let json_string_result = task::spawn_blocking(move || {
            serde_json::to_string_pretty(&content_cloned)
                .map_err(|e| format!("Failed to serialize JSON: {}", e))
        }).await.map_err(|e| format!("Failed to run blocking task for JSON serialization: {}", e))?;

        let json_string = json_string_result?; // Handle the inner Result from the blocking task

        // Write the JSON file asynchronously
        fs::write(&path_buf, json_string).await.map_err(|e| format!("Failed to write file: {}", e))
    }

    fn get_key_by_client(client: &str) -> &str {
        if client == "vscode" {
            "servers"
        } else {
            "mcpServers"
        }
    }

    pub async fn add_mcp_server(
        path: &Path,
        client: &str,
        name: &str,
        config: Value,
    ) -> Result<Value, String> {
        let mut json = Self::read_json_file(path).await?;
        let key = Self::get_key_by_client(client);

        if !json.is_object() {
            json = json!({});
        }

        if !json.as_object().unwrap().contains_key(key) {
            json[key] = json!({});
        }

        if json[key].as_object().unwrap().contains_key(name) {
            return Err(format!("Server '{}' already exists in '{}'", name, key));
        }

        json[key][name] = config;

        Self::write_json_file(path, &json).await?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub async fn remove_mcp_server(path: &Path, client: &str, name: &str) -> Result<Value, String> {
        let mut json = Self::read_json_file(path).await?;
        let key = Self::get_key_by_client(client);

        if json.is_object() && json.as_object().unwrap().contains_key(key) {
            if json[key].is_object() && json[key].as_object().unwrap().contains_key(name) {
                json[key].as_object_mut().unwrap().remove(name);
            }
        }

        Self::write_json_file(path, &json).await?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub async fn update_mcp_server(
        path: &Path,
        client: &str,
        name: &str,
        config: Value,
    ) -> Result<Value, String> {
        let mut json = Self::read_json_file(path).await?;
        let key = Self::get_key_by_client(client);

        if json.is_object() && json.as_object().unwrap().contains_key(key) {
            if json[key].is_object() && json[key].as_object().unwrap().contains_key(name) {
                json[key][name] = config;
            } else {
                return Self::add_mcp_server(path, client, name, config).await;
            }
        } else {
            return Self::add_mcp_server(path, client, name, config).await;
        }

        Self::write_json_file(path, &json).await?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub async fn disable_mcp_server(path: &Path, client: &str, name: &str) -> Result<Value, String> {
        let mut json = Self::read_json_file(path).await?;
        let key = Self::get_key_by_client(client);

        if !json.is_object() {
            return Err("Invalid JSON structure".to_string());
        }

        // Check if server exists in active servers
        if !json.as_object().unwrap().contains_key(key)
            || !json[key].is_object()
            || !json[key].as_object().unwrap().contains_key(name)
        {
            return Err(format!("Server '{}' not found in active servers", name));
        }

        // Get server config
        let server_config = json[key][name].clone();

        // Remove from active servers
        json[key].as_object_mut().unwrap().remove(name);

        // Ensure __disabled section exists
        if !json.as_object().unwrap().contains_key("__disabled") {
            json["__disabled"] = json!({});
        }

        // Add to disabled section
        json["__disabled"][name] = server_config;

        Self::write_json_file(path, &json).await?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub async fn enable_mcp_server(path: &Path, client: &str, name: &str) -> Result<Value, String> {
        let mut json = Self::read_json_file(path).await?;
        let key = Self::get_key_by_client(client);

        if !json.is_object() {
            return Err("Invalid JSON structure".to_string());
        }

        // Check if server exists in disabled section
        if !json.as_object().unwrap().contains_key("__disabled")
            || !json["__disabled"].is_object()
            || !json["__disabled"].as_object().unwrap().contains_key(name)
        {
            return Err(format!("Server '{}' not found in disabled servers", name));
        }

        // Get server config from disabled section
        let server_config = json["__disabled"][name].clone();

        // Remove from disabled section
        json["__disabled"].as_object_mut().unwrap().remove(name);

        // Remove empty __disabled section
        if json["__disabled"].as_object().unwrap().is_empty() {
            json.as_object_mut().unwrap().remove("__disabled");
        }

        // Ensure active servers section exists
        if !json.as_object().unwrap().contains_key(key) {
            json[key] = json!({});
        }

        // Check if server already exists in active servers
        if json[key].as_object().unwrap().contains_key(name) {
            return Err(format!(
                "Server '{}' already exists in active servers",
                name
            ));
        }

        // Add to active servers
        json[key][name] = server_config;

        Self::write_json_file(path, &json).await?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub async fn list_disabled_servers(path: &Path) -> Result<Value, String> {
        let json = Self::read_json_file(path).await?;

        if json.is_object() && json.as_object().unwrap().contains_key("__disabled") {
            Ok(json["__disabled"].clone())
        } else {
            Ok(json!({}))
        }
    }

    pub async fn batch_delete_mcp_servers(
        path: &Path,
        client: &str,
        server_names: Vec<String>,
    ) -> Result<Value, String> {
        let mut json = Self::read_json_file(path).await?;
        let key = Self::get_key_by_client(client);

        if !json.is_object() {
            return Err("Invalid JSON structure".to_string());
        }

        // First, enable all disabled servers that are in the list
        let mut servers_to_enable = Vec::new();
        if json.as_object().unwrap().contains_key("__disabled") {
            if let Some(disabled_obj) = json["__disabled"].as_object() {
                for server_name in &server_names {
                    if disabled_obj.contains_key(server_name) {
                        servers_to_enable.push(server_name.clone());
                    }
                }
            }
        }

        // Enable disabled servers by moving them to active section
        for server_name in servers_to_enable {
            if let Some(server_config) = json["__disabled"]
                .as_object_mut()
                .and_then(|disabled| disabled.remove(&server_name))
            {
                // Ensure active servers section exists
                if !json.as_object().unwrap().contains_key(key) {
                    json[key] = json!({});
                }

                // Add to active servers
                json[key][&server_name] = server_config;
            }
        }

        // Clean up empty __disabled section
        if let Some(disabled_obj) = json["__disabled"].as_object() {
            if disabled_obj.is_empty() {
                json.as_object_mut().unwrap().remove("__disabled");
            }
        }

        // Now delete all servers from active section
        if json.as_object().unwrap().contains_key(key) {
            if let Some(servers_obj) = json[key].as_object_mut() {
                for server_name in &server_names {
                    servers_obj.remove(server_name);
                }
            }
        }

        Self::write_json_file(path, &json).await?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }
}
