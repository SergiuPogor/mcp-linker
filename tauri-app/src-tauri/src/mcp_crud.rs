use crate::client::ClientConfig;
use crate::json_manager::JsonManager;
use serde_json::Value;

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
pub async fn batch_delete_mcp_servers(
    client_name: String,
    path: Option<String>,
    server_names: Vec<String>,
) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::batch_delete_mcp_servers(file_path, &client_name, server_names).await
}
