use dirs::home_dir;
use std::path::{Path, PathBuf};

#[allow(dead_code)]
pub struct ClientConfig {
    pub name: String,
    pub path: PathBuf,
}

impl ClientConfig {
    pub fn new(name: &str, path: Option<&str>) -> Self {
        #[cfg(debug_assertions)]
        println!("name: {}, path: {:?}", name, path);
        let home = home_dir().unwrap().to_str().unwrap().to_string();
        let path = match (name, path) {
            ("claude", _) => {
                #[cfg(target_os = "macos")]
                {
                    PathBuf::from(home)
                        .join("Library/Application Support/Claude/claude_desktop_config.json")
                }
                #[cfg(target_os = "windows")]
                {
                    PathBuf::from(home).join("AppData/Roaming/Claude/claude_desktop_config.json")
                }
                #[cfg(not(any(target_os = "macos", target_os = "windows")))]
                {
                    PathBuf::from("")
                }
            }
            ("cline", _) => {
                #[cfg(target_os = "macos")]
                {
                    PathBuf::from(home)
                        .join("Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json")
                }
                #[cfg(not(any(target_os = "macos")))]
                {
                    PathBuf::from("")
                }
            }
            ("vscode", Some(base_path)) => {
                // For VSCode, we use the provided path + .vscode/mcp.json
                // If base_path is empty, use home directory
                if base_path.is_empty() {
                    PathBuf::from(&home).join(".vscode/mcp.json")
                } else {
                    PathBuf::from(base_path).join(".vscode/mcp.json")
                }
            }
            ("cursor", None) => PathBuf::from(&home).join(".cursor/mcp.json"),
            ("cursor", Some(base_path)) => {
                // For Cursor, we use the provided path + .cursor/mcp.json
                // If base_path is empty, use home directory
                if base_path.is_empty() {
                    PathBuf::from(&home).join(".cursor/mcp.json")
                } else {
                    PathBuf::from(base_path).join(".cursor/mcp.json")
                }
            }
            ("mcphub", None) => PathBuf::from(home).join(".config/mcphub/servers.json"),
            ("windsurf", _) => PathBuf::from(home).join(".codeium/windsurf/mcp_config.json"),
            ("mcplinker", _) => PathBuf::from(home).join(".config/mcplinker/mcp.json"),
            (_, Some(path_str)) => {
                if path_str.is_empty() {
                    PathBuf::from(&home).join("mcp.json")
                } else {
                    let given_path = PathBuf::from(path_str);
                    if given_path.is_file() || given_path.extension().map_or(false, |ext| ext == "json") {
                        given_path
                    } else {
                        given_path.join("mcp.json")
                    }
                }
            }
            _ => {
                // Default case
                PathBuf::from("")
            }
        };

        Self {
            name: name.to_string(),
            path,
        }
    }

    pub fn get_path(&self) -> &Path {
        &self.path
    }
}
