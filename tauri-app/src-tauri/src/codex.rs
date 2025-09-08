use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;

use crate::config::{get_config_path, CodexConfig};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum McpServerConfig {
    #[serde(rename = "stdio")]
    Stdio {
        command: String,
        args: Vec<String>,
        #[serde(skip_serializing_if = "Option::is_none")]
        env: Option<HashMap<String, String>>,
    },
    #[serde(rename = "http")]
    Http { url: String },
}

pub async fn read_mcp_servers() -> Result<HashMap<String, McpServerConfig>, String> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        return Ok(HashMap::new());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: CodexConfig =
        toml::from_str(&content).map_err(|e| format!("Failed to parse config file: {}", e))?;

    Ok(config.mcp_servers)
}

fn load_config() -> Result<CodexConfig, String> {
    let config_path = get_config_path()?;
    if !config_path.exists() {
        return Ok(CodexConfig::default());
    }
    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;
    let config: CodexConfig =
        toml::from_str(&content).map_err(|e| format!("Failed to parse config file: {}", e))?;
    Ok(config)
}

fn save_config(config: &CodexConfig) -> Result<(), String> {
    let config_path = get_config_path()?;
    let toml_content =
        toml::to_string(&config).map_err(|e| format!("Failed to serialize config: {}", e))?;
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }
    fs::write(&config_path, toml_content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    Ok(())
}

pub async fn add_mcp_server(name: String, config: McpServerConfig) -> Result<(), String> {
    let mut codex_config = load_config()?;
    codex_config.mcp_servers.insert(name, config);
    save_config(&codex_config)
}

pub async fn delete_mcp_server(name: String) -> Result<(), String> {
    let mut config = load_config()?;
    let mut removed = false;
    if config.mcp_servers.remove(&name).is_some() {
        removed = true;
    }
    if config.disabled_mcp_servers.remove(&name).is_some() {
        removed = true;
    }
    if !removed {
        return Err(format!("MCP server '{}' not found", name));
    }
    save_config(&config)
}

// Disabled servers support for Codex
pub fn list_disabled() -> Result<HashMap<String, McpServerConfig>, String> {
    let config = load_config()?;
    Ok(config.disabled_mcp_servers)
}

pub fn disable(name: &str) -> Result<(), String> {
    let mut config = load_config()?;
    if let Some(server) = config.mcp_servers.remove(name) {
        config.disabled_mcp_servers.insert(name.to_string(), server);
        save_config(&config)
    } else {
        Ok(())
    }
}

pub fn enable(name: &str) -> Result<(), String> {
    let mut config = load_config()?;
    if let Some(server) = config.disabled_mcp_servers.remove(name) {
        config.mcp_servers.insert(name.to_string(), server);
        save_config(&config)
    } else {
        Ok(())
    }
}

pub fn update_disabled(name: &str, server: McpServerConfig) -> Result<(), String> {
    let mut config = load_config()?;
    config
        .disabled_mcp_servers
        .insert(name.to_string(), server);
    save_config(&config)
}
