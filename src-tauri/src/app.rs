use std::path::{Path, PathBuf};
use dirs::home_dir;

#[allow(dead_code)]
pub struct AppConfig {
    pub name: String,
    pub path: PathBuf,
}

impl AppConfig {
    pub fn new(name: &str, path: Option<&str>) -> Self {
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
                    PathBuf::from(home)
                        .join("AppData/Roaming/Claude/claude_desktop_config.json")
                }
                #[cfg(not(any(target_os = "macos", target_os = "windows")))]
                {
                    PathBuf::from("")
                }
            }
            ("cursor", Some(base_path)) => {
                // For Cursor, we use the provided path + .cursor/mcp.json
                PathBuf::from(base_path).join(".cursor/mcp.json")
            }
            ("cursor", None) => {
                PathBuf::from(home).join(".cursor/mcp.json") // 修复：添加默认路径
            }
            ("windsurf", _) => {
                PathBuf::from(home)
                    .join(".codeium/windsurf/mcp_config.json")
            }
            (_, Some(path)) => {
                // For any other app, use the provided path + mcp.json
                PathBuf::from(path).join("mcp.json")
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
