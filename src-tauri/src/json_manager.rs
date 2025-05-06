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
            if json.as_object().unwrap().contains_key(servers_key) && 
               !json.as_object().unwrap().contains_key(mcp_servers_key) {
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

    pub fn add_mcp_server(path: &Path, client: &str, name: &str, config: Value) -> Result<Value, String> {
        let mut json = Self::read_json_file(path)?;
        let key = Self::get_key_by_client(client);

        if !json.is_object() {
            json = json!({});
        }

        if !json.as_object().unwrap().contains_key(key) {
            json[key] = json!({});
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

    pub fn update_mcp_server(path: &Path, client: &str, name: &str, config: Value) -> Result<Value, String> {
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
}
