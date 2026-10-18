//! Everything MCP Linker knows about client configs, without the desktop app:
//! reading and writing each client's servers, converting servers between
//! clients for sync, and the license. The app wraps these as Tauri commands
//! (feature `tauri`); the `mcpl` CLI calls them directly.

pub mod adapter;
pub mod claude_code_commands;
pub mod claude_disabled;
pub mod client;
pub mod clients;
pub mod codex;
pub mod config;
pub mod json_commands;
pub mod json_manager;
pub mod license;
pub mod mcp_commands;
pub mod mcp_crud;
pub mod sync;
pub mod target;
