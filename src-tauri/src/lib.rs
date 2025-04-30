// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use dirs::home_dir;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    #[serde(rename = "mcpServers")]
    mcp_servers: Value, // 允许动态 JSON 结构
}

mod app;
mod cmd;
mod installer;
mod json_manager;

fn update_env_path() {
    let home = home_dir().unwrap().to_str().unwrap().to_string();
    let local_bin = format!("{}/.local/bin", home);
    let current_path = env::var("PATH").unwrap_or_default();

    let new_paths: Vec<String> = if cfg!(target_os = "windows") {
        vec![local_bin]
    } else {
        vec![
            "/opt/homebrew/bin".into(),
            "/usr/local/bin".into(),
            local_bin,
        ]
    };
    
    let separator = if cfg!(target_os = "windows") { ";" } else { ":" };
    
    let updated_path = format!(
        "{}{}{}",
        new_paths.join(separator),
        separator,
        current_path
    );
    
    env::set_var("PATH", &updated_path);
}

#[tauri::command]
fn get_path_env() -> String {
    env::var("PATH").unwrap_or_else(|_| "PATH not found".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    update_env_path();
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            cmd::read_json_file,
            cmd::write_json_file,
            cmd::get_app_path,
            cmd::add_mcp_server,
            cmd::remove_mcp_server,
            cmd::update_mcp_server,
            installer::check_command_exists,
            installer::install_command,
            get_path_env
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
