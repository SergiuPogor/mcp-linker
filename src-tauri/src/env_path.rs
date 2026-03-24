use dirs::home_dir;
use std::env;

/// Update the PATH environment variable to include common local bin directories.
pub fn update_env_path() {
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

    let separator = if cfg!(target_os = "windows") {
        ";"
    } else {
        ":"
    };

    let updated_path = format!("{}{}{}", new_paths.join(separator), separator, current_path);

    env::set_var("PATH", &updated_path);
}

#[tauri::command]
pub fn get_path_env() -> String {
    env::var("PATH").unwrap_or_else(|_| "PATH not found".to_string())
}
