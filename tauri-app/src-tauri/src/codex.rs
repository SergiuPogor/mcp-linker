use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::fs;
use tokio::io::AsyncWriteExt;
use tokio::sync::Mutex;

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

static CODEX_CFG_LOCK: Lazy<Mutex<()>> = Lazy::new(|| Mutex::new(()));

pub async fn read_mcp_servers() -> Result<HashMap<String, McpServerConfig>, String> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        println!("[Codex] config not found: {}", config_path.display());
        return Ok(HashMap::new());
    }

    let content = fs::read_to_string(&config_path)
        .await
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: CodexConfig =
        toml::from_str(&content).map_err(|e| format!("Failed to parse config file: {}", e))?;
    println!(
        "[Codex] read servers: active={}, disabled={}",
        config.mcp_servers.len(),
        config.disabled_mcp_servers.len()
    );

    Ok(config.mcp_servers)
}

async fn load_config() -> Result<CodexConfig, String> {
    let config_path = get_config_path()?;
    if !config_path.exists() {
        println!(
            "[Codex] load default config (no file): {}",
            config_path.display()
        );
        return Ok(CodexConfig::default());
    }
    let content = fs::read_to_string(&config_path)
        .await
        .map_err(|e| format!("Failed to read config file: {}", e))?;
    let config: CodexConfig =
        toml::from_str(&content).map_err(|e| format!("Failed to parse config file: {}", e))?;
    println!(
        "[Codex] load config: active={}, disabled={}",
        config.mcp_servers.len(),
        config.disabled_mcp_servers.len()
    );
    Ok(config)
}

async fn save_config(config: &CodexConfig) -> Result<(), String> {
    let _guard = CODEX_CFG_LOCK.lock().await;
    let config_path = get_config_path()?;
    let toml_content =
        toml::to_string(&config).map_err(|e| format!("Failed to serialize config: {}", e))?;
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)
            .await
            .map_err(|e| format!("Failed to create config directory: {}", e))?;
    }

    let tmp_path = config_path.with_extension("toml.tmp");
    println!(
        "[Codex] save config: path={}, tmp={}, active={}, disabled={}",
        config_path.display(),
        tmp_path.display(),
        config.mcp_servers.len(),
        config.disabled_mcp_servers.len()
    );
    // Write temp file then atomically rename
    let mut file = fs::File::create(&tmp_path)
        .await
        .map_err(|e| format!("Failed to create temp file: {}", e))?;
    file.write_all(toml_content.as_bytes())
        .await
        .map_err(|e| format!("Failed to write temp file: {}", e))?;
    file.flush()
        .await
        .map_err(|e| format!("Failed to flush temp file: {}", e))?;
    drop(file);
    fs::rename(&tmp_path, &config_path)
        .await
        .map_err(|e| format!("Failed to rename temp file: {}", e))?;
    Ok(())
}

pub async fn add_mcp_server(name: String, config: McpServerConfig) -> Result<(), String> {
    let mut codex_config = load_config().await?;
    codex_config.mcp_servers.insert(name, config);
    save_config(&codex_config).await
}

pub async fn delete_mcp_server(name: String) -> Result<(), String> {
    println!("[Codex] delete request: {}", name);
    let mut config = load_config().await?;
    println!(
        "[Codex] before delete: active_keys={:?} disabled_keys={:?}",
        config.mcp_servers.keys().collect::<Vec<_>>(),
        config.disabled_mcp_servers.keys().collect::<Vec<_>>()
    );
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
    println!("[Codex] delete matched, saving");
    save_config(&config).await
}

// Disabled servers support for Codex
pub async fn list_disabled() -> Result<HashMap<String, McpServerConfig>, String> {
    let config = load_config().await?;
    Ok(config.disabled_mcp_servers)
}

pub async fn disable(name: &str) -> Result<(), String> {
    let mut config = load_config().await?;
    println!(
        "[Codex] disable request: {} | active_keys={:?}",
        name,
        config.mcp_servers.keys().collect::<Vec<_>>()
    );
    if let Some(server) = config.mcp_servers.remove(name) {
        config.disabled_mcp_servers.insert(name.to_string(), server);
        println!("[Codex] disable matched, saving");
        save_config(&config).await
    } else {
        println!("[Codex] disable miss");
        Ok(())
    }
}

pub async fn enable(name: &str) -> Result<(), String> {
    let mut config = load_config().await?;
    println!(
        "[Codex] enable request: {} | disabled_keys={:?}",
        name,
        config.disabled_mcp_servers.keys().collect::<Vec<_>>()
    );
    if let Some(server) = config.disabled_mcp_servers.remove(name) {
        config.mcp_servers.insert(name.to_string(), server);
        println!("[Codex] enable matched, saving");
        save_config(&config).await
    } else {
        println!("[Codex] enable miss");
        Ok(())
    }
}

pub async fn update_disabled(name: &str, server: McpServerConfig) -> Result<(), String> {
    let mut config = load_config().await?;
    println!(
        "[Codex] update_disabled: {} | disabled_keys(before)={:?}",
        name,
        config.disabled_mcp_servers.keys().collect::<Vec<_>>()
    );
    config.disabled_mcp_servers.insert(name.to_string(), server);
    println!(
        "[Codex] update_disabled saved | disabled_keys(after)={:?}",
        config.disabled_mcp_servers.keys().collect::<Vec<_>>()
    );
    save_config(&config).await
}
