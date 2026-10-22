// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use std::env;
use std::sync::{Arc, Mutex};

use mcpl_core::{claude_code_commands, claude_disabled, client, clients, codex, json_commands as cmd, license, mcp_commands, mcp_crud, plugins};

mod app_settings;
mod claude_tools;

mod encryption;
mod git;
mod installer;
mod mcp_inspector;
#[cfg(target_os = "macos")]
mod menu;
mod window;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build());

    #[cfg(any(target_os = "windows", target_os = "linux"))]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            window::show_window(app, argv);
        }));
    }

    builder = builder.plugin(tauri_plugin_deep_link::init());

    builder
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            clients::list_clients,
            client::list_workspaces,
            app_settings::read_app_settings,
            app_settings::save_project_preferences,
            cmd::read_json_file,
            cmd::write_json_file,
            cmd::get_app_path,
            cmd::check_mcplinker_config_exists,
            mcp_crud::add_mcp_server,
            mcp_inspector::mcp_inspector_connect,
            mcp_inspector::mcp_inspector_list_tools,
            mcp_inspector::mcp_inspector_call_tool,
            mcp_inspector::mcp_inspector_disconnect,
            codex::codex_get_tool_policy,
            codex::codex_set_tool_policy,
            mcp_crud::remove_mcp_server,
            mcp_crud::update_mcp_server,
            mcp_crud::batch_delete_mcp_servers,
            mcp_commands::disable_mcp_server,
            mcp_commands::enable_mcp_server,
            mcp_commands::list_disabled_servers,
            mcp_commands::update_disabled_mcp_server,
            installer::check_command_exists,
            installer::install_command,
            git::git_clone,
            encryption::generate_encryption_key,
            encryption::encrypt_data,
            encryption::decrypt_data,
            claude_code_commands::claude_mcp_list,
            claude_tools::claude_mcp_tools,
            claude_tools::claude_get_tool_policy,
            claude_tools::claude_set_tool_policy,
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
            license::license_status,
            license::activate_license,
            license::deactivate_license,
            plugins::plugin_list,
            plugins::plugin_details,
            plugins::plugin_set_enabled,
            plugins::plugin_install,
            plugins::plugin_uninstall,
            plugins::plugin_marketplaces,
            plugins::plugin_add_marketplace,
            plugins::plugin_copy,
            plugins::plugin_activity,
            plugins::plugin_catalog,
            plugins::plugin_icon,
        ])
        .manage(mcp_inspector::InspectorState::default())
        .manage(Arc::new(Mutex::new(None::<String>)))
        .setup(|_app| {
            use tauri::Manager;
            if let Ok(dir) = _app.path().app_config_dir() {
                license::init(dir);
            }
            let inspector = _app.state::<mcp_inspector::InspectorState>().inner().clone();
            tauri::async_runtime::spawn(async move {
                let mut interval = tokio::time::interval(std::time::Duration::from_secs(60));
                loop { interval.tick().await; inspector.expire_idle().await; }
            });
            #[cfg(target_os = "macos")]
            menu::setup(_app)?;
            #[cfg(any(windows, target_os = "linux"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                _app.deep_link().register_all()?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
