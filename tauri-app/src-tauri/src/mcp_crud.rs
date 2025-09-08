use crate::client::ClientConfig;
use crate::codex as codex_cmds;
use crate::codex::McpServerConfig as CodexServerConfig;
use crate::json_manager::JsonManager;
use serde_json::Value;

pub(crate) fn normalize_codex_config(mut server_config: Value) -> Result<Value, String> {
    // Ensure a "type" discriminator exists for serde(tag="type") enum
    if !server_config.get("type").and_then(|v| v.as_str()).is_some() {
        if server_config.get("command").is_some() {
            // stdio style
            if let Some(obj) = server_config.as_object_mut() {
                obj.insert("type".into(), Value::from("stdio"));
            }
        } else if server_config.get("url").is_some() {
            // http style; treat both http and sse as http in codex config
            if let Some(obj) = server_config.as_object_mut() {
                obj.insert("type".into(), Value::from("http"));
            }
        } else {
            return Err("missing field `type`".into());
        }
    } else if let Some(t) = server_config.get("type").and_then(|v| v.as_str()) {
        // Map unsupported variants
        if t == "sse" {
            if let Some(obj) = server_config.as_object_mut() {
                obj.insert("type".into(), Value::from("http"));
            }
        }
    }

    // Coerce env values to strings if present under stdio
    if let Some(env) = server_config.get_mut("env") {
        if let Some(map) = env.as_object_mut() {
            let keys: Vec<String> = map.keys().cloned().collect();
            for k in keys {
                if let Some(v) = map.get(&k) {
                    let s = if v.is_string() {
                        v.as_str().unwrap().to_string()
                    } else {
                        v.to_string()
                    };
                    map.insert(k, Value::from(s));
                }
            }
        }
    }

    Ok(server_config)
}

#[tauri::command]
pub async fn add_mcp_server(
    client_name: String,
    path: Option<String>,
    server_name: String,
    server_config: Value,
) -> Result<Value, String> {
    if client_name == "codex" {
        // Convert JSON to Codex server config and insert (overwrite if exists)
        let cfg_val = normalize_codex_config(server_config)
            .map_err(|e| format!("Invalid server config for codex: {}", e))?;
        let cfg: CodexServerConfig = serde_json::from_value(cfg_val)
            .map_err(|e| format!("Invalid server config for codex: {}", e))?;
        codex_cmds::add_mcp_server(server_name, cfg).await?;
        // Return a normalized shape for UI
        let servers = codex_cmds::read_mcp_servers().await?;
        return Ok(serde_json::json!({"mcpServers": servers}));
    }
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
    if client_name == "codex" {
        codex_cmds::delete_mcp_server(server_name).await?;
        let servers = codex_cmds::read_mcp_servers().await?;
        return Ok(serde_json::json!({"mcpServers": servers}));
    }
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
    if client_name == "codex" {
        let cfg_val = normalize_codex_config(server_config)
            .map_err(|e| format!("Invalid server config for codex: {}", e))?;
        let cfg: CodexServerConfig = serde_json::from_value(cfg_val)
            .map_err(|e| format!("Invalid server config for codex: {}", e))?;
        codex_cmds::add_mcp_server(server_name, cfg).await?;
        let servers = codex_cmds::read_mcp_servers().await?;
        return Ok(serde_json::json!({"mcpServers": servers}));
    }
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
    if client_name == "codex" {
        for name in server_names {
            let _ = codex_cmds::delete_mcp_server(name).await; // ignore missing
        }
        let servers = codex_cmds::read_mcp_servers().await?;
        return Ok(serde_json::json!({"mcpServers": servers}));
    }
    let app_config = ClientConfig::new(&client_name, path.as_deref());
    let file_path = app_config.get_path();

    JsonManager::batch_delete_mcp_servers(file_path, &client_name, server_names).await
}
