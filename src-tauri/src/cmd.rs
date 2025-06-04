use crate::client::ClientConfig;
use crate::json_manager::JsonManager;
use serde_json::{json, Value};
use std::path::PathBuf;

#[tauri::command]
pub async fn read_json_file(client_name: String, path: Option<String>) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    // Remove the file existence check - let JsonManager handle it
    let mut json = JsonManager::read_json_file(file_path)?;

    // Ensure the JSON always has the required structure
    if !json.is_object() {
        json = json!({});
    }

    // Handle client-specific key normalization
    if client_name == "vscode" {
        // For VS Code, ensure both "servers" and "mcpServers" exist
        if !json.as_object().unwrap().contains_key("servers") {
            json["servers"] = json!({});
        }
        if !json.as_object().unwrap().contains_key("mcpServers") {
            json["mcpServers"] = json["servers"].clone();
        }
    } else {
        // For other clients, ensure "mcpServers" exists
        if !json.as_object().unwrap().contains_key("mcpServers") {
            json["mcpServers"] = json!({});
        }
    }

    Ok(json)
}

#[tauri::command]
pub async fn write_json_file(
    client_name: String,
    path: Option<String>,
    content: Value,
) -> Result<(), String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::write_json_file(file_path, &content)
}

#[tauri::command]
pub async fn get_app_path(client_name: String, path: Option<String>) -> Result<String, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
pub async fn add_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
    server_config: Value,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::add_mcp_server(file_path, &client_name, &server_name, server_config)
}

#[tauri::command]
pub async fn remove_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::remove_mcp_server(file_path, &client_name, &server_name)
}

#[tauri::command]
pub async fn update_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
    server_config: Value,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::update_mcp_server(file_path, &client_name, &server_name, server_config)
}

#[tauri::command]
pub fn check_mcplinker_config_exists() -> bool {
    let home_dir = dirs::home_dir().unwrap_or_default();
    let config_path: PathBuf = home_dir.join(".config/mcplinker/mcp.json");
    config_path.exists()
}
