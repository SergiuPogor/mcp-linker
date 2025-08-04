use dirs::home_dir;
use std::path::{Path, PathBuf};

pub struct ClientConfig {
    pub name: String,
    pub path: PathBuf,
}

impl ClientConfig {
    pub fn new(name: &str, path: Option<&str>) -> Self {
        let home = home_dir().expect("Failed to get home directory");

        let path = match (name, path) {
            ("claude_code", Some(base_path)) if !base_path.is_empty() => {
                PathBuf::from(base_path).join(".mcp.json")
            }
            ("claude", _) => Self::claude_config_path(&home),
            ("cline", _) => Self::cline_config_path(&home),
            ("roo_code", Some(base_path)) if !base_path.is_empty() => {
                PathBuf::from(base_path).join(".roo/mcp.json")
            }
            ("roo_code", _) => Self::roo_config_path(&home),
            ("vscode", Some(base_path)) if !base_path.is_empty() => {
                PathBuf::from(base_path).join(".vscode/mcp.json")
            }
            ("vscode", _) => home.join(".vscode/mcp.json"),
            ("cursor", Some(base_path)) if !base_path.is_empty() => {
                PathBuf::from(base_path).join(".cursor/mcp.json")
            }
            ("cursor", _) => home.join(".cursor/mcp.json"),
            ("mcphub", _) => home.join(".config/mcphub/servers.json"),
            ("windsurf", _) => home.join(".codeium/windsurf/mcp_config.json"),
            ("cherrystudio", _) => home.join(".config/cherrystudio/mcp.json"),
            ("mcplinker", _) => home.join(".config/mcplinker/mcp.json"),
            (_, Some(path_str)) if !path_str.is_empty() => {
                let given_path = PathBuf::from(path_str);
                if given_path.is_file() || given_path.extension().map_or(false, |ext| ext == "json")
                {
                    given_path
                } else {
                    given_path.join("mcp.json")
                }
            }
            _ => PathBuf::new(),
        };

        Self {
            name: name.to_string(),
            path,
        }
    }

    fn claude_config_path(home: &Path) -> PathBuf {
        if cfg!(target_os = "macos") {
            home.join("Library/Application Support/Claude/claude_desktop_config.json")
        } else if cfg!(target_os = "windows") {
            home.join("AppData/Roaming/Claude/claude_desktop_config.json")
        } else {
            PathBuf::new()
        }
    }

    fn cline_config_path(home: &Path) -> PathBuf {
        if cfg!(target_os = "macos") {
            home.join("Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")
        } else if cfg!(target_os = "windows") {
            home.join("AppData/Roaming/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")
        } else if cfg!(target_os = "linux") {
            home.join(".config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")
        } else {
            PathBuf::new()
        }
    }

    fn roo_config_path(home: &Path) -> PathBuf {
        if cfg!(target_os = "macos") {
            home.join("Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json")
        } else if cfg!(target_os = "windows") {
            home.join("AppData/Roaming/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json")
        } else if cfg!(target_os = "linux") {
            home.join(".config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json")
        } else {
            PathBuf::new()
        }
    }

    pub fn get_path(&self) -> &Path {
        &self.path
    }
}
