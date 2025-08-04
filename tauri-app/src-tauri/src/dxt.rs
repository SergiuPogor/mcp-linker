use glob::glob;
use std::fs;
use std::io::{Cursor, Read};
use zip::ZipArchive;

#[tauri::command]
pub async fn load_manifests() -> Result<serde_json::Value, String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let base_path = home.join(".config/finder/dxt");
        let pattern = base_path.join("*/*/manifest.json");

        let mut manifests = serde_json::Map::new();

        if base_path.exists() {
            for entry in glob(pattern.to_str().unwrap())? {
                let path = entry?;
                let parent_dir = path.parent().ok_or_else(|| anyhow::anyhow!("Invalid path"))?;
                let repo = parent_dir
                    .file_name()
                    .ok_or_else(|| anyhow::anyhow!("Invalid path"))?
                    .to_string_lossy()
                    .to_string();

                let user_dir = parent_dir
                    .parent()
                    .ok_or_else(|| anyhow::anyhow!("Invalid path"))?;
                let user = user_dir
                    .file_name()
                    .ok_or_else(|| anyhow::anyhow!("Invalid path"))?
                    .to_string_lossy()
                    .to_string();

                let content = tokio::fs::read_to_string(&path).await?;
                let json: serde_json::Value = serde_json::from_str(&content)?;
                manifests.insert(format!("{}/{}", user, repo), json);
            }
        }

        Ok(serde_json::Value::Array(manifests.into_values().collect()))
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}

#[tauri::command]
pub async fn load_manifest(user: String, repo: String) -> Result<serde_json::Value, String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let manifest_path = home
            .join(".config/finder/dxt")
            .join(&user)
            .join(&repo)
            .join("manifest.json");

        if !manifest_path.exists() {
            return Err(anyhow::anyhow!("Manifest not found for {}/{}", user, repo));
        }

        let content = tokio::fs::read_to_string(&manifest_path).await?;
        let json: serde_json::Value = serde_json::from_str(&content)?;
        Ok(json)
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}

#[tauri::command]
pub async fn fetch_and_save_manifest(user: &str, repo: &str) -> Result<(), String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let dxt_path = home.join(".config/finder/dxt").join(user).join(repo);

        // Create the directory if it doesn't exist
        if !dxt_path.exists() {
            fs::create_dir_all(&dxt_path)?;
        }

        // Construct the GitHub URL
        let url = format!(
            "https://raw.githubusercontent.com/awesome-claude-dxt/servers/main/{}/{}/manifest.json",
            user, repo
        );

        // Download the manifest.json
        let response = reqwest::get(&url).await?;
        let content = response.text().await?;

        // Save the file
        let manifest_path = dxt_path.join("manifest.json");
        tokio::fs::write(manifest_path, content).await?;

        Ok(())
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}

#[tauri::command]
pub async fn read_dxt_setting(user: String, repo: String) -> Result<serde_json::Value, String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let settings_dir = home.join(".config/finder/dxt-settings");
        tokio::fs::create_dir_all(&settings_dir).await?;
        let settings_path = settings_dir.join(format!("{}.{}.json", &user, &repo));

        if !settings_path.exists() {
            return Err(anyhow::anyhow!("Manifest not found for {}.{}", user, repo));
        }

        let content = tokio::fs::read_to_string(&settings_path).await?;
        let json: serde_json::Value = serde_json::from_str(&content)?;
        Ok(json)
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}

#[tauri::command]
pub async fn save_dxt_setting(user: String, repo: String, content: serde_json::Value) -> Result<(), String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let settings_dir = home.join(".config/finder/dxt-settings");
        let settings_path = settings_dir.join(format!("{}.{}.json", &user, &repo));
        let content_string = serde_json::to_string_pretty(&content)?;
        tokio::fs::write(settings_path, content_string).await?;
        Ok(())
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}

#[tauri::command]
pub async fn download_and_extract_manifests() -> Result<(), String> {
    async {
        let home = dirs::home_dir().ok_or_else(|| anyhow::anyhow!("Cannot find home directory"))?;
        let dxt_base_path = home.join(".config/finder/dxt");
        
        // Create base directory if it doesn't exist
        if !dxt_base_path.exists() {
            fs::create_dir_all(&dxt_base_path)?;
        }

        // Download the zip file
        let url = "https://github.com/milisp/awesome-claude-dxt/releases/download/v1.0.0/manifests.json.zip";
        let response = reqwest::get(url).await?;
        
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Failed to download manifests zip: {}", response.status()));
        }

        let zip_data = response.bytes().await?;
        
        // Extract the zip file
        let reader = Cursor::new(zip_data);
        let mut archive = ZipArchive::new(reader)?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i)?;
            
            // Look for manifests.json file in the zip
            if file.name() == "manifests.json" || file.name().ends_with("/manifests.json") {
                let mut contents = String::new();
                file.read_to_string(&mut contents)?;
                
                // Parse the JSON array of manifests
                let manifests: serde_json::Value = serde_json::from_str(&contents)?;
                
                if let Some(manifests_array) = manifests.as_array() {
                    // Save each manifest to its own directory structure
                    for manifest in manifests_array {
                        if let (Some(name), Some(author)) = (
                            manifest.get("name").and_then(|n| n.as_str()),
                            manifest.get("author").and_then(|a| a.get("name")).and_then(|n| n.as_str())
                        ) {
                            let manifest_dir = dxt_base_path.join(author).join(name);
                            fs::create_dir_all(&manifest_dir)?;
                            
                            let manifest_path = manifest_dir.join("manifest.json");
                            let manifest_content = serde_json::to_string_pretty(manifest)?;
                            tokio::fs::write(manifest_path, manifest_content).await?;
                        }
                    }
                }
                break; // Found and processed manifests.json, no need to continue
            }
        }

        Ok(())
    }
    .await
    .map_err(|e: anyhow::Error| e.to_string())
}

#[tauri::command]
pub async fn check_manifests_exist() -> Result<bool, String> {
    let home = dirs::home_dir().ok_or("Cannot find home directory")?;
    let dxt_base_path = home.join(".config/finder/dxt");
    
    if !dxt_base_path.exists() {
        return Ok(false);
    }

    // Check if there are any manifest.json files
    let pattern = dxt_base_path.join("*/*/manifest.json");
    match glob(pattern.to_str().unwrap()) {
        Ok(paths) => {
            for _path in paths {
                return Ok(true); // Found at least one manifest
            }
            Ok(false)
        }
        Err(_) => Ok(false),
    }
}