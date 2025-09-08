use dirs::home_dir;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

// Reuse the McpServerConfig definition from crate::codex
use crate::codex::McpServerConfig;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CodexConfig {
    #[serde(default)]
    pub projects: HashMap<String, serde_json::Value>,
    #[serde(default, rename = "mcp_servers")]
    pub mcp_servers: HashMap<String, McpServerConfig>,
    #[serde(default, rename = "disabled_mcp_servers")]
    pub disabled_mcp_servers: HashMap<String, McpServerConfig>,
    #[serde(default)]
    pub model_providers: HashMap<String, serde_json::Value>,
    #[serde(default)]
    pub profiles: HashMap<String, serde_json::Value>,
}

pub fn get_config_path() -> Result<PathBuf, String> {
    let home = home_dir().ok_or_else(|| "Failed to get home directory".to_string())?;
    Ok(home.join(".codex").join("config.toml"))
}
