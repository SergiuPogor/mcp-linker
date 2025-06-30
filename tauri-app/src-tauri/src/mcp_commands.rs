use crate::client::ClientConfig;
use crate::json_manager::JsonManager;
use serde_json::Value;

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

    JsonManager::list_disabled_servers(file_path, &client_name).await
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

    JsonManager::update_disabled_mcp_server(file_path, &client_name, &server_name, server_config)
        .await
}
