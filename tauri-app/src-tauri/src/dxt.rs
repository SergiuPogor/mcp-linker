use std::fs::File;
use std::io::Cursor;
use zip::ZipArchive;
use std::io::Write;
use std::path::{Path, PathBuf};

#[tauri::command]
pub fn extract_manifests_zip(zip_data: Vec<u8>, target_dir: String) -> Result<(), String> {
    let reader = Cursor::new(zip_data);
    let mut archive = ZipArchive::new(reader).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = PathBuf::from(&target_dir).join(file.name());

        // Ensure parent directories exist so File::create doesn't fail.
        if let Some(parent) = outpath.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
        std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn read_binary_file(path: String) -> Result<Vec<u8>, String> {
    std::fs::read(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn download_file(url: String, dest_path: String) -> Result<(), String> {
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    if !response.status().is_success() {
        return Err(format!("Download failed: {}", response.status()));
    }
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    // Create parent directories for the destination path if they don’t exist.
    if let Some(parent) = Path::new(&dest_path).parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    let mut file = File::create(&dest_path).map_err(|e| e.to_string())?;
    file.write_all(&bytes).map_err(|e| e.to_string())?;
    Ok(())
}