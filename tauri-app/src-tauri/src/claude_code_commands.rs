use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Command;
use tauri::command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClaudeCodeServer {
    pub name: String,
    pub server_type: String, // "http", "sse", "stdio"
    pub url: Option<String>,
    pub command: Option<String>,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    pub status: String, // "active", "inactive", "needs_auth", "error"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddServerRequest {
    pub name: String,
    pub server_type: String,
    pub url: Option<String>,
    pub command: Option<String>,
    pub args: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaudeCodeResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

/// List all MCP servers configured in Claude Code
#[command]
pub async fn claude_mcp_list(working_dir: Option<String>) -> Result<Vec<ClaudeCodeServer>, String> {
    let mut cmd = Command::new("claude");
    cmd.args(&["mcp", "list"]);
    
    // Set working directory if provided
    if let Some(dir) = working_dir {
        cmd.current_dir(&dir);
    }
    
    let output = cmd.output()
        .map_err(|e| format!("Failed to execute claude mcp list: {}", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Claude MCP list failed: {}", error));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    
    // Parse the output - this is a simplified parser
    // In a real implementation, you'd need to parse the actual Claude Code CLI output format
    let servers = parse_claude_mcp_list_output(&stdout)?;
    
    Ok(servers)
}

/// Get details for a specific MCP server
#[command]
pub async fn claude_mcp_get(name: String, working_dir: Option<String>) -> Result<ClaudeCodeServer, String> {
    let mut cmd = Command::new("claude");
    cmd.args(&["mcp", "get", &name]);
    
    // Set working directory if provided
    if let Some(dir) = working_dir {
        cmd.current_dir(&dir);
    }
    
    let output = cmd.output()
        .map_err(|e| format!("Failed to execute claude mcp get: {}", e))?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Claude MCP get failed: {}", error));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let server = parse_claude_mcp_get_output(&stdout, &name)?;
    
    Ok(server)
}

/// Add a new MCP server to Claude Code
#[command]
pub async fn claude_mcp_add(request: AddServerRequest, working_dir: Option<String>) -> Result<ClaudeCodeResponse, String> {
    let mut cmd = Command::new("claude");
    cmd.args(&["mcp", "add"]);
    
    // Set working directory if provided
    if let Some(dir) = working_dir {
        cmd.current_dir(&dir);
    }

    // Add server name
    cmd.arg(&request.name);

    // Add URL or command based on server type
    match request.server_type.as_str() {
        "http" | "sse" => {
            if let Some(url) = &request.url {
                cmd.arg(url);
            } else {
                return Err("URL is required for HTTP/SSE servers".to_string());
            }
        }
        "stdio" => {
            if let Some(command) = &request.command {
                cmd.arg(command);
                
                // Add arguments if provided
                if let Some(args) = &request.args {
                    let args_vec: Vec<&str> = args.split_whitespace().collect();
                    cmd.args(args_vec);
                }
            } else {
                return Err("Command is required for stdio servers".to_string());
            }
        }
        _ => {
            return Err(format!("Unsupported server type: {}", request.server_type));
        }
    }

    let output = cmd.output()
        .map_err(|e| format!("Failed to execute claude mcp add: {}", e))?;

    let success = output.status.success();
    let message = if success {
        format!("Successfully added server '{}'", request.name)
    } else {
        String::from_utf8_lossy(&output.stderr).to_string()
    };

    Ok(ClaudeCodeResponse {
        success,
        message,
        data: None,
    })
}

/// Remove an MCP server from Claude Code
#[command]
pub async fn claude_mcp_remove(name: String, working_dir: Option<String>) -> Result<ClaudeCodeResponse, String> {
    let mut cmd = Command::new("claude");
    cmd.args(&["mcp", "remove", &name]);
    
    // Set working directory if provided
    if let Some(dir) = working_dir {
        cmd.current_dir(&dir);
    }

    let output = cmd.output()
        .map_err(|e| format!("Failed to execute claude mcp remove: {}", e))?;

    let success = output.status.success();
    let message = if success {
        format!("Successfully removed server '{}'", name)
    } else {
        String::from_utf8_lossy(&output.stderr).to_string()
    };

    Ok(ClaudeCodeResponse {
        success,
        message,
        data: None,
    })
}

/// Check if Claude Code CLI is available
#[command]
pub async fn check_claude_cli_available() -> Result<bool, String> {
    let output = Command::new("claude")
        .args(&["--version"])
        .output();

    match output {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}

/// Parse the output of `claude mcp list` command
fn parse_claude_mcp_list_output(output: &str) -> Result<Vec<ClaudeCodeServer>, String> {
    let mut servers = Vec::new();
    let lines: Vec<&str> = output.lines().collect();
    
    for line in lines {
        if let Some(server) = parse_server_line(line) {
            servers.push(server);
        }
    }
    
    Ok(servers)
}

/// Parse a single server line from the list output
fn parse_server_line(line: &str) -> Option<ClaudeCodeServer> {
    // Example line: "sentry: https://mcp.sentry.dev/mcp (HTTP) - ⚠ Needs authentication"
    if line.trim().is_empty() || line.starts_with("Checking") || line.starts_with("plux") {
        return None;
    }

    let parts: Vec<&str> = line.split(':').collect();
    if parts.len() < 2 {
        return None;
    }

    let name = parts[0].trim().to_string();
    let rest = parts[1].trim();

    // Extract URL and type
    let (url, server_type, status) = if rest.contains("(HTTP)") {
        let url = rest.split(" (HTTP)").next().unwrap_or("").trim();
        let status = if rest.contains("⚠ Needs authentication") {
            "needs_auth"
        } else if rest.contains("✓") {
            "active"
        } else {
            "inactive"
        };
        (Some(url.to_string()), "http".to_string(), status.to_string())
    } else if rest.contains("(SSE)") {
        let url = rest.split(" (SSE)").next().unwrap_or("").trim();
        let status = if rest.contains("⚠ Needs authentication") {
            "needs_auth"
        } else if rest.contains("✓") {
            "active"
        } else {
            "inactive"
        };
        (Some(url.to_string()), "sse".to_string(), status.to_string())
    } else {
        // Assume stdio for others
        (None, "stdio".to_string(), "active".to_string())
    };

    Some(ClaudeCodeServer {
        name,
        server_type,
        url,
        command: None, // Will be filled by claude_mcp_get if needed
        args: None,
        env: None,
        status,
    })
}

/// Parse the output of `claude mcp get <name>` command
fn parse_claude_mcp_get_output(output: &str, name: &str) -> Result<ClaudeCodeServer, String> {
    let mut server = ClaudeCodeServer {
        name: name.to_string(),
        server_type: "http".to_string(),
        url: None,
        command: None,
        args: None,
        env: None,
        status: "active".to_string(),
    };

    let lines: Vec<&str> = output.lines().collect();
    
    for line in lines {
        let line = line.trim();
        
        if line.starts_with("Status: ⚠ Needs authentication") {
            server.status = "needs_auth".to_string();
        } else if line.starts_with("Status: ✓") {
            server.status = "active".to_string();
        } else if line.starts_with("Type: http") {
            server.server_type = "http".to_string();
        } else if line.starts_with("Type: sse") {
            server.server_type = "sse".to_string();
        } else if line.starts_with("Type: stdio") {
            server.server_type = "stdio".to_string();
        } else if line.starts_with("URL: ") {
            server.url = Some(line.replace("URL: ", ""));
        } else if line.starts_with("Command: ") {
            server.command = Some(line.replace("Command: ", ""));
        }
    }

    Ok(server)
}