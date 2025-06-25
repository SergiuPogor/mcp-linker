// Integration tests for JsonManager
use crate::json_manager::JsonManager;
use serde_json::json;
use tempfile::tempdir;
use std::path::PathBuf;

#[tokio::test]
async fn test_update_mcp_server_active() {
    let temp_dir = tempdir().unwrap();
    let config_path = temp_dir.path().join("test_config.json");
    // Create initial config with active server
    let initial_config = json!({
        "mcpServers": {
            "test-server": {
                "command": "test-command",
                "args": ["arg1"]
            }
        }
    });
    JsonManager::write_json_file(&config_path, &initial_config).await.unwrap();
    // Update the active server
    let updated_config = json!({
        "command": "updated-command",
        "args": ["arg1", "arg2"]
    });
    let result = JsonManager::update_mcp_server(&config_path, "mcplinker", "test-server", updated_config.clone()).await;
    assert!(result.is_ok());
    // Verify the update
    let final_config = JsonManager::read_json_file(&config_path).await.unwrap();
    assert_eq!(final_config["mcpServers"]["test-server"], updated_config);
}

#[tokio::test]
async fn test_update_mcp_server_disabled() {
    let temp_dir = tempdir().unwrap();
    let config_path = temp_dir.path().join("test_config.json");
    // Create initial config with disabled server
    let initial_config = json!({
        "__disabled": {
            "test-server": {
                "command": "test-command",
                "args": ["arg1"]
            }
        }
    });
    JsonManager::write_json_file(&config_path, &initial_config).await.unwrap();
    // Update the disabled server
    let updated_config = json!({
        "command": "updated-command",
        "args": ["arg1", "arg2"]
    });
    let result = JsonManager::update_mcp_server(&config_path, "mcplinker", "test-server", updated_config.clone()).await;
    assert!(result.is_ok());
    // Verify the update
    let final_config = JsonManager::read_json_file(&config_path).await.unwrap();
    assert_eq!(final_config["__disabled"]["test-server"], updated_config);
}

#[tokio::test]
async fn test_update_disabled_mcp_server() {
    let temp_dir = tempdir().unwrap();
    let config_path = temp_dir.path().join("test_config.json");
    // Create initial config with disabled server
    let initial_config = json!({
        "__disabled": {
            "test-server": {
                "command": "test-command",
                "args": ["arg1"]
            }
        }
    });
    JsonManager::write_json_file(&config_path, &initial_config).await.unwrap();
    // Update the disabled server using the specific function
    let updated_config = json!({
        "command": "updated-command",
        "args": ["arg1", "arg2"]
    });
    let result = JsonManager::update_disabled_mcp_server(&config_path, "mcplinker", "test-server", updated_config.clone()).await;
    assert!(result.is_ok());
    // Verify the update
    let final_config = JsonManager::read_json_file(&config_path).await.unwrap();
    assert_eq!(final_config["__disabled"]["test-server"], updated_config);
} 