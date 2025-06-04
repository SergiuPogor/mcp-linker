use serde_json::{json, Value};
use std::fs;
use std::io::ErrorKind;
use std::path::Path;

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

    pub fn read_json_file(path: &Path) -> Result<Value, String> {
        match fs::read_to_string(path) {
            Ok(content) => match serde_json::from_str(&content) {
                Ok(json) => Ok(json),
                Err(e) => Err(format!("Failed to parse JSON: {}", e)),
            },
            Err(e) => {
                if e.kind() == ErrorKind::NotFound {
                    // Return empty JSON if file doesn't exist
                    Ok(json!({}))
                } else {
                    Err(format!("Failed to read file: {}", e))
                }
            }
        }
    }

    pub fn write_json_file(path: &Path, content: &Value) -> Result<(), String> {
        // Ensure directory exists
        if let Some(parent) = path.parent() {
            if !parent.exists() {
                if let Err(e) = fs::create_dir_all(parent) {
                    return Err(format!("Failed to create directory: {}", e));
                }
            }
        }

        // Write the JSON file with pretty formatting
        let json_string = match serde_json::to_string_pretty(content) {
            Ok(s) => s,
            Err(e) => return Err(format!("Failed to serialize JSON: {}", e)),
        };

        match fs::write(path, json_string) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to write file: {}", e)),
        }
    }

    fn get_key_by_client(client: &str) -> &str {
        if client == "vscode" {
            "servers"
        } else {
            "mcpServers"
        }
    }

    pub fn add_mcp_server(
        path: &Path,
        client: &str,
        name: &str,
        config: Value,
    ) -> Result<Value, String> {
        let mut json = Self::read_json_file(path)?;
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

        Self::write_json_file(path, &json)?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub fn remove_mcp_server(path: &Path, client: &str, name: &str) -> Result<Value, String> {
        let mut json = Self::read_json_file(path)?;
        let key = Self::get_key_by_client(client);

        if json.is_object() && json.as_object().unwrap().contains_key(key) {
            if json[key].is_object() && json[key].as_object().unwrap().contains_key(name) {
                json[key].as_object_mut().unwrap().remove(name);
            }
        }

        Self::write_json_file(path, &json)?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub fn update_mcp_server(
        path: &Path,
        client: &str,
        name: &str,
        config: Value,
    ) -> Result<Value, String> {
        let mut json = Self::read_json_file(path)?;
        let key = Self::get_key_by_client(client);

        if json.is_object() && json.as_object().unwrap().contains_key(key) {
            if json[key].is_object() && json[key].as_object().unwrap().contains_key(name) {
                json[key][name] = config;
            } else {
                return Self::add_mcp_server(path, client, name, config);
            }
        } else {
            return Self::add_mcp_server(path, client, name, config);
        }

        Self::write_json_file(path, &json)?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub fn disable_mcp_server(path: &Path, client: &str, name: &str) -> Result<Value, String> {
        let mut json = Self::read_json_file(path)?;
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

        Self::write_json_file(path, &json)?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub fn enable_mcp_server(path: &Path, client: &str, name: &str) -> Result<Value, String> {
        let mut json = Self::read_json_file(path)?;
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
            return Err(format!("Server '{}' already exists in active servers", name));
        }

        // Add to active servers
        json[key][name] = server_config;

        Self::write_json_file(path, &json)?;

        // Normalize response key to mcpServers for client
        Self::normalize_response_key(json, client)
    }

    pub fn list_disabled_servers(path: &Path) -> Result<Value, String> {
        let json = Self::read_json_file(path)?;

        if json.is_object() && json.as_object().unwrap().contains_key("__disabled") {
            Ok(json["__disabled"].clone())
        } else {
            Ok(json!({}))
        }
    }
}
