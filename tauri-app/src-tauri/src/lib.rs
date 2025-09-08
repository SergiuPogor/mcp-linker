// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::env;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager};

use cmd::chat::ChatState;
use mcp_client::tool::ToolSet;

pub struct GlobalToolSet(pub Arc<ToolSet>);

mod claude_code_commands;
mod client;
mod cmd;
mod config;
mod dxt;
mod codex;
mod adapter;
mod claude_disabled;
mod encryption;
mod env_path;
mod filesystem;
mod git;
mod installer;
mod json_manager;
mod mcp_client;
mod mcp_commands;
mod mcp_crud;
mod mcp_sync;

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    #[serde(rename = "mcpServers", alias = "servers")]
    mcp_servers: Value,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_path::update_env_path();

    let mut builder =
        tauri::Builder::default().plugin(tauri_plugin_updater::Builder::new().build());

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            show_window(app, argv);
        }));
    }

    builder = builder.plugin(tauri_plugin_deep_link::init());

    builder
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            cmd::read_json_file,
            cmd::write_json_file,
            cmd::get_app_path,
            cmd::check_mcplinker_config_exists,
            mcp_crud::add_mcp_server,
            mcp_crud::remove_mcp_server,
            mcp_crud::update_mcp_server,
            mcp_crud::batch_delete_mcp_servers,
            mcp_commands::disable_mcp_server,
            mcp_commands::enable_mcp_server,
            mcp_commands::list_disabled_servers,
            mcp_commands::update_disabled_mcp_server,
            mcp_sync::sync_mcp_config,
            installer::check_command_exists,
            installer::install_command,
            env_path::get_path_env,
            git::git_clone,
            encryption::generate_encryption_key,
            encryption::encrypt_data,
            encryption::decrypt_data,
            dxt::load_manifests,
            dxt::load_manifest,
            dxt::fetch_and_save_manifest,
            dxt::read_dxt_setting,
            dxt::save_dxt_setting,
            dxt::download_and_extract_manifests,
            dxt::check_manifests_exist,
            claude_code_commands::claude_mcp_list,
            claude_code_commands::claude_mcp_get,
            claude_code_commands::claude_mcp_add,
            claude_code_commands::claude_mcp_remove,
            claude_code_commands::claude_list_projects,
            claude_code_commands::check_claude_cli_available,
            claude_code_commands::check_claude_config_exists,
            claude_disabled::claude_list_disabled,
            claude_disabled::claude_disable_server,
            claude_disabled::claude_enable_server,
            claude_disabled::claude_update_disabled,
            filesystem::read_directory,
            filesystem::get_default_directories,
            filesystem::read_file_content,
            filesystem::calculate_file_tokens,
            cmd::chat::send_message,
            cmd::chat::send_message_stream,
            cmd::chat::list_tools,
        ])
        .manage(ChatState {
            session: Mutex::new(None),
        })
        .manage(Arc::new(Mutex::new(None::<String>)))
        .setup(|app| {
            #[cfg(any(windows, target_os = "linux"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register_all()?;
            }

            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                let mcp_config = config::McpConfig::load(&app_handle).await.unwrap();
                let mcp_clients = mcp_config.create_mcp_clients().await.unwrap();

                let mut tool_set = mcp_client::tool::ToolSet::default();
                for (name, client) in mcp_clients.iter() {
                    println!("load MCP tool: {}", name);
                    let server = client.peer().clone();
                    let tools = mcp_client::tool::get_mcp_tools(server).await.unwrap();

                    for tool in tools {
                        tool_set.add_tool(tool);
                    }
                }
                tool_set.set_clients(mcp_clients);
                println!("{:?}", tool_set);

                app_handle.manage(GlobalToolSet(Arc::new(tool_set)));
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn show_window(app: &AppHandle, args: Vec<String>) {
    let windows = app.webview_windows();
    let main_window = windows.values().next().expect("Sorry, no window found");

    main_window
        .set_focus()
        .expect("Can't Bring Window to Focus");

    dbg!(args.clone());
    if args.len() > 1 {
        let url = args[1].clone();

        dbg!(url.clone());
        if url.starts_with("mcp-linker://") {
            let _ = main_window.emit("deep-link-received", url);
        }
    }
}
