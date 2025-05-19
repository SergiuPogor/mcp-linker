use crate::client::ClientConfig;
use crate::json_manager::JsonManager;
use serde_json::Value;

#[tauri::command]
pub async fn read_json_file(client_name: String, path: Option<String>) -> Result<Value, String> {
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    if !file_path.exists() && client_name != "claude" {
        return Err(format!("File not found: {}", file_path.display()));
    }

    let json = JsonManager::read_json_file(file_path)?;
    // Normalize the response for client consistency
    if client_name == "vscode" && json.is_object() {
        let mut json_clone = json.clone();
        if json_clone.as_object().unwrap().contains_key("servers")
            && !json_clone.as_object().unwrap().contains_key("mcpServers")
        {
            json_clone["mcpServers"] = json_clone["servers"].clone();
        }
        Ok(json_clone)
    } else {
        Ok(json)
    }
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
