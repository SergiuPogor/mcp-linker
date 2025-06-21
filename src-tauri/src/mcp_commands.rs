use crate::client::ClientConfig;
use crate::json_manager::JsonManager;
use serde_json::json;
use serde_json::Value;
use std::path::PathBuf;

#[tauri::command]
pub async fn add_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
    server_config: Value,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::add_mcp_server(file_path, &client_name, &server_name, server_config).await
}

#[tauri::command]
pub async fn remove_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::remove_mcp_server(file_path, &client_name, &server_name).await
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

    JsonManager::update_mcp_server(file_path, &client_name, &server_name, server_config).await
}

#[tauri::command]
pub async fn disable_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::disable_mcp_server(file_path, &client_name, &server_name).await
}

#[tauri::command]
pub async fn enable_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::enable_mcp_server(file_path, &client_name, &server_name).await
}

#[tauri::command]
pub async fn list_disabled_servers(
    client_name: String,
    path: Option<String>,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::list_disabled_servers(file_path).await
}

#[tauri::command]
pub fn check_mcplinker_config_exists() -> bool {
    let home_dir = dirs::home_dir().unwrap_or_default();
    let config_path: PathBuf = home_dir.join(".config/mcplinker/mcp.json");
    config_path.exists()
}

#[tauri::command]
pub async fn sync_mcp_config(
    from_client: String,
    to_client: String,
    from_path: Option<String>,
    to_path: Option<String>,
    override_all: bool,
) -> Result<(), String> {
    let from_config = ClientConfig::new(&from_client, from_path.as_deref());
    let to_config = ClientConfig::new(&to_client, to_path.as_deref());

    let from_path = from_config.get_path();
    let to_path = to_config.get_path();

    let from_json = JsonManager::read_json_file(from_path).await?;
    let mut to_json = JsonManager::read_json_file(to_path).await.unwrap_or_else(|_| json!({}));

    let from_servers = from_json.get("mcpServers").cloned().unwrap_or(json!({}));
    let from_disabled = from_json.get("__disabled").cloned().unwrap_or(json!({}));

    if override_all {
        to_json["mcpServers"] = from_servers;
        to_json["__disabled"] = from_disabled;
    } else {
        // Ensure mcpServers and __disabled objects exist
        if to_json["mcpServers"].is_null() {
            to_json["mcpServers"] = json!({});
        }
        if to_json["__disabled"].is_null() {
            to_json["__disabled"] = json!({});
        }

        // Handle mcpServers from from_servers
        if let Some(from_map) = from_servers.as_object() {
            for (k, v) in from_map {
                // Check if server doesn't exist in either mcpServers or __disabled
                let exists_in_servers = to_json["mcpServers"]
                    .as_object()
                    .map(|obj| obj.contains_key(k))
                    .unwrap_or(false);
                let exists_in_disabled = to_json["__disabled"]
                    .as_object()
                    .map(|obj| obj.contains_key(k))
                    .unwrap_or(false);

                if !exists_in_servers && !exists_in_disabled {
                    if let Some(to_servers) = to_json["mcpServers"].as_object_mut() {
                        to_servers.insert(k.clone(), v.clone());
                    }
                }
            }
        }

        // Handle __disabled from from_disabled
        if let Some(from_map) = from_disabled.as_object() {
            for (k, v) in from_map {
                // Check if server doesn't exist in either mcpServers or __disabled
                let exists_in_servers = to_json["mcpServers"]
                    .as_object()
                    .map(|obj| obj.contains_key(k))
                    .unwrap_or(false);
                let exists_in_disabled = to_json["__disabled"]
                    .as_object()
                    .map(|obj| obj.contains_key(k))
                    .unwrap_or(false);

                if !exists_in_servers && !exists_in_disabled {
                    if let Some(to_disabled) = to_json["__disabled"].as_object_mut() {
                        to_disabled.insert(k.clone(), v.clone());
                    }
                }
            }
        }
    }

    JsonManager::write_json_file(to_path, &to_json).await
}

#[tauri::command]
pub async fn batch_delete_mcp_servers(
    client_name: String,
    path: Option<String>,
    server_names: Vec<String>,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::batch_delete_mcp_servers(file_path, &client_name, server_names).await
}

#[tauri::command]
pub async fn update_disabled_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
    server_config: Value,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::update_disabled_mcp_server(file_path, &client_name, &server_name, server_config).await
}
