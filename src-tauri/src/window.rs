#[cfg(any(target_os = "windows", target_os = "linux"))]
use tauri::{AppHandle, Emitter, Manager};

#[cfg(any(target_os = "windows", target_os = "linux"))]
pub fn show_window(app: &AppHandle, args: Vec<String>) {
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
