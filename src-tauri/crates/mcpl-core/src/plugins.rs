//! Claude Code and Codex plugins: bundles of MCP servers, skills and (Claude
//! Code only) commands, agents and hooks. See docs/plugins.md.
//!
//! The clients' own CLIs (`claude plugin`, `codex plugin`) stay the source of
//! truth: listing, installing and removing go through them, so their caches,
//! scopes and defaults keep working. MCP Linker reads plugin directories to
//! show what is inside, writes Codex's `enabled` flag (Codex has no command
//! for it), and copies plugins between the two clients through a local
//! marketplace it owns, the bridge.

use crate::sync::convert_server;
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value, json};
use std::path::{Path, PathBuf};
use tokio::process::Command;

/// The bridge marketplace's name in both clients.
pub const BRIDGE: &str = "mcp-linker-bridge";

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum PluginClient {
    ClaudeCode,
    Codex,
}

impl PluginClient {
    /// `claude-code`, `cc`, `claude_code` or `codex`.
    pub fn parse(id: &str) -> Result<Self, String> {
        match crate::target::internal_id(id) {
            Some("claude_code") => Ok(Self::ClaudeCode),
            Some("codex") => Ok(Self::Codex),
            _ => Err(format!("Plugins are supported for claude-code and codex, not '{id}'.")),
        }
    }

    pub fn id(self) -> &'static str {
        match self {
            Self::ClaudeCode => "claude-code",
            Self::Codex => "codex",
        }
    }

    pub const ALL: [PluginClient; 2] = [Self::ClaudeCode, Self::Codex];

    fn program(self) -> &'static str {
        match self {
            Self::ClaudeCode => "claude",
            Self::Codex => "codex",
        }
    }

    /// The manifest directory a plugin needs for this client.
    fn manifest_dir(self) -> &'static str {
        match self {
            Self::ClaudeCode => ".claude-plugin",
            Self::Codex => ".codex-plugin",
        }
    }

    /// `claude-code` → internal client id used by `sync::convert_server`.
    fn server_format(self) -> &'static str {
        match self {
            Self::ClaudeCode => "claude_code",
            Self::Codex => "codex",
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Plugin {
    /// `name@marketplace`.
    pub id: String,
    pub name: String,
    pub marketplace: String,
    pub client: PluginClient,
    pub version: Option<String>,
    pub enabled: bool,
    /// Claude Code's install scope (`user`, `project`, `local`).
    pub scope: Option<String>,
    /// The plugin directory, when the client reports one.
    pub path: Option<PathBuf>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginDetails {
    #[serde(flatten)]
    pub plugin: Plugin,
    pub description: Option<String>,
    pub mcp_servers: Map<String, Value>,
    pub skills: Vec<Skill>,
    /// Parts only Claude Code understands (`commands`, `agents`, `hooks`, …);
    /// they are left out when a plugin is copied to Codex.
    pub other: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CopyReport {
    /// The id the plugin now has in the destination client.
    pub id: String,
    pub mcp_servers: Vec<String>,
    pub skills: Vec<String>,
    /// Parts the destination can't use, left out.
    pub skipped: Vec<String>,
}

fn split_id(id: &str) -> (String, String) {
    match id.split_once('@') {
        Some((name, marketplace)) => (name.into(), marketplace.into()),
        None => (id.into(), String::new()),
    }
}

async fn run(client: PluginClient, args: &[&str]) -> Result<String, String> {
    let output = Command::new(client.program())
        .args(args)
        .output()
        .await
        .map_err(|e| match e.kind() {
            std::io::ErrorKind::NotFound => format!("`{}` was not found on PATH; install {} first.", client.program(), client.id()),
            _ => format!("Failed to run `{}`: {e}", client.program()),
        })?;
    let stdout = String::from_utf8_lossy(&output.stdout).into_owned();
    if output.status.success() {
        return Ok(stdout);
    }
    let stderr = String::from_utf8_lossy(&output.stderr);
    let detail = if stderr.trim().is_empty() { stdout.trim() } else { stderr.trim() };
    Err(format!("`{} {}` failed: {detail}", client.program(), args.join(" ")))
}

fn parse_json(text: &str, what: &str) -> Result<Value, String> {
    serde_json::from_str(text).map_err(|e| format!("Unexpected {what} output: {e}"))
}

/// Installed plugins.
pub async fn list(client: PluginClient) -> Result<Vec<Plugin>, String> {
    let text = run(client, &["plugin", "list", "--json"]).await?;
    Ok(plugins_from_list(client, &parse_json(&text, "plugin list")?))
}

fn plugins_from_list(client: PluginClient, value: &Value) -> Vec<Plugin> {
    let text = |row: &Value, key: &str| row.get(key).and_then(Value::as_str).map(str::to_string);
    match client {
        // [{ id, version, scope, enabled, installPath, … }]
        PluginClient::ClaudeCode => value
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(|row| {
                let id = text(row, "id")?;
                let (name, marketplace) = split_id(&id);
                Some(Plugin {
                    name,
                    marketplace,
                    client,
                    version: text(row, "version"),
                    enabled: row.get("enabled").and_then(Value::as_bool).unwrap_or(false),
                    scope: text(row, "scope"),
                    path: text(row, "installPath").map(PathBuf::from),
                    id,
                })
            })
            .collect(),
        // { installed: [{ pluginId, name, marketplaceName, version, enabled, source: { path } }] }
        PluginClient::Codex => value
            .get("installed")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
            .filter(|row| row.get("installed").and_then(Value::as_bool) != Some(false))
            .filter_map(|row| {
                let id = text(row, "pluginId")?;
                let (name, marketplace) = split_id(&id);
                Some(Plugin {
                    name: text(row, "name").unwrap_or(name),
                    marketplace: text(row, "marketplaceName").unwrap_or(marketplace),
                    client,
                    version: text(row, "version"),
                    enabled: row.get("enabled").and_then(Value::as_bool).unwrap_or(false),
                    scope: None,
                    path: row.pointer("/source/path").and_then(Value::as_str).map(PathBuf::from),
                    id,
                })
            })
            .collect(),
    }
}

/// Finds an installed plugin by `name@marketplace`, or by bare name when only one matches.
pub async fn find(client: PluginClient, id: &str) -> Result<Plugin, String> {
    let plugins = list(client).await?;
    if let Some(plugin) = plugins.iter().find(|p| p.id == id) {
        return Ok(plugin.clone());
    }
    let named: Vec<_> = plugins.iter().filter(|p| p.name == id).collect();
    match named.as_slice() {
        [plugin] => Ok((*plugin).clone()),
        [] => Err(format!("Plugin '{id}' is not installed in {}.", client.id())),
        _ => Err(format!(
            "Several plugins are named '{id}' in {}: {}. Use name@marketplace.",
            client.id(),
            named.iter().map(|p| p.id.as_str()).collect::<Vec<_>>().join(", ")
        )),
    }
}

fn read_json_file(path: &Path) -> Option<Value> {
    std::fs::read_to_string(path).ok().and_then(|text| serde_json::from_str(&text).ok())
}

/// A manifest field that names one path, several, or (for `mcpServers`) the value inline.
fn paths_of(value: Option<&Value>) -> Vec<String> {
    match value {
        Some(Value::String(path)) => vec![path.clone()],
        Some(Value::Array(paths)) => paths.iter().filter_map(Value::as_str).map(str::to_string).collect(),
        _ => Vec::new(),
    }
}

/// `${CLAUDE_PLUGIN_ROOT}` in a server entry becomes the plugin directory.
fn expand_root(value: &Value, root: &Path) -> Value {
    match value {
        Value::String(text) => Value::String(text.replace("${CLAUDE_PLUGIN_ROOT}", &root.to_string_lossy())),
        Value::Array(items) => Value::Array(items.iter().map(|v| expand_root(v, root)).collect()),
        Value::Object(map) => Value::Object(map.iter().map(|(k, v)| (k.clone(), expand_root(v, root))).collect()),
        other => other.clone(),
    }
}

fn skill_frontmatter(path: &Path) -> (Option<String>, Option<String>) {
    let Ok(text) = std::fs::read_to_string(path) else { return (None, None) };
    let Some(rest) = text.strip_prefix("---") else { return (None, None) };
    let Some(end) = rest.find("\n---") else { return (None, None) };
    let field = |key: &str| {
        rest[..end].lines().find_map(|line| {
            let value = line.strip_prefix(key)?.strip_prefix(':')?.trim();
            (!value.is_empty()).then(|| value.trim_matches(['"', '\'']).to_string())
        })
    };
    (field("name"), field("description"))
}

/// What a plugin directory holds.
pub struct PluginDir {
    /// Claude Code's manifest, else Codex's.
    pub manifest: Option<Value>,
    pub servers: Map<String, Value>,
    /// Each skill with its directory.
    pub skills: Vec<(Skill, PathBuf)>,
    /// Claude Code-only parts.
    pub other: Vec<String>,
}

pub fn read_dir(root: &Path) -> PluginDir {
    let manifest = read_json_file(&root.join(".claude-plugin/plugin.json"))
        .or_else(|| read_json_file(&root.join(".codex-plugin/plugin.json")));
    let field = |key: &str| manifest.as_ref().and_then(|m| m.get(key));

    let mut servers = Map::new();
    let mcp = field("mcpServers");
    let mut files = paths_of(mcp);
    if mcp.is_none() {
        files.push(".mcp.json".into());
    }
    if let Some(Value::Object(inline)) = mcp {
        servers.extend(inline.iter().map(|(k, v)| (k.clone(), v.clone())));
    }
    for file in files {
        if let Some(Value::Object(json)) = read_json_file(&root.join(file)) {
            // A .mcp.json is `{ mcpServers: { … } }`, or the server map itself.
            let map = json.get("mcpServers").and_then(Value::as_object).cloned().unwrap_or(json);
            servers.extend(map);
        }
    }
    let servers = servers.into_iter().map(|(k, v)| (k, expand_root(&v, root))).collect();

    let mut skill_dirs = paths_of(field("skills"));
    if skill_dirs.is_empty() {
        skill_dirs.push("skills".into());
    }
    let mut skills = Vec::new();
    for dir in skill_dirs {
        let dir = root.join(dir);
        let Ok(entries) = std::fs::read_dir(&dir) else { continue };
        let mut entries: Vec<_> = entries.flatten().map(|e| e.path()).filter(|p| p.join("SKILL.md").is_file()).collect();
        entries.sort();
        for path in entries {
            let (name, description) = skill_frontmatter(&path.join("SKILL.md"));
            let name = name.unwrap_or_else(|| path.file_name().unwrap_or_default().to_string_lossy().into_owned());
            skills.push((Skill { name, description }, path));
        }
    }

    let mut other = Vec::new();
    for part in ["commands", "agents", "hooks", "outputStyles", "lspServers"] {
        let in_manifest = field(part).is_some();
        let default_dir = match part {
            "hooks" => root.join("hooks/hooks.json").exists(),
            "outputStyles" => root.join("output-styles").is_dir(),
            "lspServers" => root.join(".lsp.json").exists(),
            _ => root.join(part).is_dir(),
        };
        if in_manifest || default_dir {
            other.push(part.to_string());
        }
    }
    PluginDir { manifest, servers, skills, other }
}

pub async fn details(client: PluginClient, id: &str) -> Result<PluginDetails, String> {
    let plugin = find(client, id).await?;
    let PluginDir { manifest, servers: mcp_servers, skills, other } = match &plugin.path {
        Some(path) => read_dir(path),
        None => PluginDir { manifest: None, servers: Map::new(), skills: Vec::new(), other: Vec::new() },
    };
    let description = manifest.as_ref().and_then(|m| m.get("description")).and_then(Value::as_str).map(str::to_string);
    Ok(PluginDetails {
        plugin,
        description,
        mcp_servers,
        skills: skills.into_iter().map(|(skill, _)| skill).collect(),
        other: if client == PluginClient::Codex { Vec::new() } else { other },
    })
}

pub async fn set_enabled(client: PluginClient, id: &str, enabled: bool) -> Result<(), String> {
    let plugin = find(client, id).await?;
    match client {
        PluginClient::ClaudeCode => {
            let mut args = vec!["plugin", if enabled { "enable" } else { "disable" }, plugin.id.as_str()];
            if let Some(scope) = plugin.scope.as_deref() {
                args.extend(["--scope", scope]);
            }
            run(client, &args).await.map(drop)
        }
        PluginClient::Codex => crate::codex::set_plugin_enabled(&plugin.id, enabled).await,
    }
}

/// Installs `name@marketplace` from a marketplace the client already knows.
pub async fn install(client: PluginClient, id: &str) -> Result<(), String> {
    let verb = match client {
        PluginClient::ClaudeCode => "install",
        PluginClient::Codex => "add",
    };
    run(client, &["plugin", verb, id]).await.map(drop)
}

pub async fn uninstall(client: PluginClient, id: &str) -> Result<(), String> {
    let plugin = find(client, id).await?;
    let verb = match client {
        PluginClient::ClaudeCode => "uninstall",
        PluginClient::Codex => "remove",
    };
    run(client, &["plugin", verb, &plugin.id]).await.map(drop)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Marketplace {
    pub name: String,
    /// A URL, `owner/repo` or a directory.
    pub source: Option<String>,
}

pub async fn marketplaces(client: PluginClient) -> Result<Vec<Marketplace>, String> {
    let text = run(client, &["plugin", "marketplace", "list", "--json"]).await?;
    let value = parse_json(&text, "marketplace list")?;
    let rows = match client {
        PluginClient::ClaudeCode => value.as_array().cloned().unwrap_or_default(),
        PluginClient::Codex => value.get("marketplaces").and_then(Value::as_array).cloned().unwrap_or_default(),
    };
    Ok(rows
        .iter()
        .filter_map(|row| {
            let name = row.get("name")?.as_str()?.to_string();
            let source = ["repo", "url", "path"]
                .iter()
                .find_map(|key| row.get(*key))
                .or_else(|| row.pointer("/marketplaceSource/source"))
                .and_then(Value::as_str)
                .map(str::to_string);
            Some(Marketplace { name, source })
        })
        .collect())
}

/// Adds a marketplace (`owner/repo`, a git URL or a directory).
pub async fn add_marketplace(client: PluginClient, source: &str) -> Result<(), String> {
    run(client, &["plugin", "marketplace", "add", source]).await.map(drop)
}

/// Where the bridge marketplace for `to` lives: `<app config dir>/plugin-bridge/<client>`.
/// One per destination, so a plugin copied both ways keeps both copies.
pub fn bridge_dir(to: PluginClient) -> Result<PathBuf, String> {
    crate::license::config_dir()
        .map(|dir| dir.join("plugin-bridge").join(to.id()))
        .ok_or_else(|| "No config directory on this system.".into())
}

fn copy_tree(from: &Path, to: &Path) -> Result<(), String> {
    std::fs::create_dir_all(to).map_err(|e| format!("Failed to create {}: {e}", to.display()))?;
    for entry in std::fs::read_dir(from).map_err(|e| format!("Failed to read {}: {e}", from.display()))?.flatten() {
        let path = entry.path();
        let name = entry.file_name();
        if name == ".git" {
            continue;
        }
        let target = to.join(&name);
        let kind = entry.file_type().map_err(|e| e.to_string())?;
        if kind.is_dir() {
            copy_tree(&path, &target)?;
        } else if kind.is_file() || (kind.is_symlink() && path.is_file()) {
            std::fs::copy(&path, &target).map_err(|e| format!("Failed to copy {}: {e}", path.display()))?;
        } else if kind.is_symlink() && path.is_dir() {
            copy_tree(&path, &target)?;
        }
    }
    Ok(())
}

fn write_json(path: &Path, value: &Value) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create {}: {e}", parent.display()))?;
    }
    let text = serde_json::to_string_pretty(value).map_err(|e| e.to_string())? + "\n";
    std::fs::write(path, text).map_err(|e| format!("Failed to write {}: {e}", path.display()))
}

/// The manifest `to` reads, built from the source manifest's common fields.
fn manifest_for(to: PluginClient, name: &str, source: Option<&Value>, has_skills: bool, has_servers: bool) -> Value {
    let field = |key: &str| source.and_then(|m| m.get(key)).cloned();
    let mut manifest = Map::new();
    manifest.insert("name".into(), json!(name));
    for key in ["version", "description", "author", "homepage", "repository", "license", "keywords"] {
        if let Some(value) = field(key) {
            manifest.insert(key.into(), value);
        }
    }
    if to == PluginClient::Codex {
        if has_skills {
            manifest.insert("skills".into(), json!("./skills/"));
        }
        if has_servers {
            manifest.insert("mcpServers".into(), json!("./.mcp.json"));
        }
        let description = field("description").and_then(|d| d.as_str().map(str::to_string)).unwrap_or_default();
        let developer = field("author").and_then(|a| a.get("name").and_then(Value::as_str).map(str::to_string));
        manifest.insert(
            "interface".into(),
            json!({
                "displayName": name,
                "shortDescription": description.chars().take(80).collect::<String>(),
                "longDescription": description,
                "developerName": developer.unwrap_or_else(|| "MCP Linker".into()),
                "category": "Developer Tools",
            }),
        );
    }
    Value::Object(manifest)
}

/// Rewrites both marketplace files of the bridge to list every plugin in it.
fn write_bridge_marketplaces(bridge: &Path) -> Result<(), String> {
    let mut names: Vec<String> = std::fs::read_dir(bridge.join("plugins"))
        .map(|entries| entries.flatten().filter(|e| e.path().is_dir()).map(|e| e.file_name().to_string_lossy().into_owned()).collect())
        .unwrap_or_default();
    names.sort();
    let claude: Vec<Value> = names.iter().map(|n| json!({ "name": n, "source": format!("./plugins/{n}") })).collect();
    write_json(
        &bridge.join(".claude-plugin/marketplace.json"),
        &json!({
            "name": BRIDGE,
            "description": "Plugins copied between Claude Code and Codex by MCP Linker.",
            "owner": { "name": "MCP Linker", "url": "https://github.com/milisp/mcp-linker" },
            "plugins": claude,
        }),
    )?;
    let codex: Vec<Value> = names
        .iter()
        .map(|n| {
            json!({
                "name": n,
                "source": { "source": "local", "path": format!("./plugins/{n}") },
                "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
                "category": "Developer Tools",
            })
        })
        .collect();
    write_json(
        &bridge.join(".agents/plugins/marketplace.json"),
        &json!({ "name": BRIDGE, "interface": { "displayName": "MCP Linker bridge" }, "plugins": codex }),
    )
}

/// Builds `<bridge>/plugins/<name>` for `to` from a plugin directory. Skills
/// are copied as they are, MCP servers are converted to `to`'s format, and
/// parts `to` can't use are dropped and reported.
pub fn stage_in_bridge(bridge: &Path, source_dir: &Path, name: &str, to: PluginClient) -> Result<CopyReport, String> {
    let PluginDir { manifest, servers, skills, other } = read_dir(source_dir);
    let dest = bridge.join("plugins").join(name);
    if dest.exists() {
        std::fs::remove_dir_all(&dest).map_err(|e| format!("Failed to replace {}: {e}", dest.display()))?;
    }
    std::fs::create_dir_all(&dest).map_err(|e| format!("Failed to create {}: {e}", dest.display()))?;

    for (skill, path) in &skills {
        let dir_name = path.file_name().unwrap_or_default();
        copy_tree(path, &dest.join("skills").join(dir_name)).map_err(|e| format!("Skill {}: {e}", skill.name))?;
    }
    let mut converted = Map::new();
    for (server, config) in &servers {
        converted.insert(server.clone(), convert_server(to.server_format(), config).map_err(|e| format!("MCP server {server}: {e}"))?);
    }
    if !converted.is_empty() {
        write_json(&dest.join(".mcp.json"), &json!({ "mcpServers": converted }))?;
    }
    for assets in ["assets", "scripts", "bin"] {
        if source_dir.join(assets).is_dir() {
            copy_tree(&source_dir.join(assets), &dest.join(assets))?;
        }
    }
    let manifest = manifest_for(to, name, manifest.as_ref(), !skills.is_empty(), !converted.is_empty());
    write_json(&dest.join(to.manifest_dir()).join("plugin.json"), &manifest)?;
    write_bridge_marketplaces(bridge)?;

    let skipped = if to == PluginClient::Codex { other } else { Vec::new() };
    Ok(CopyReport {
        id: format!("{name}@{BRIDGE}"),
        mcp_servers: converted.keys().cloned().collect(),
        skills: skills.into_iter().map(|(skill, _)| skill.name).collect(),
        skipped,
    })
}

/// Copies an installed plugin from one client to the other (a Pro feature,
/// like any sync involving Claude Code or Codex). The copy is staged in the
/// bridge marketplace and installed with the destination's own CLI.
pub async fn copy(from: PluginClient, to: PluginClient, id: &str) -> Result<CopyReport, String> {
    if from == to {
        return Err("Pick two different clients.".into());
    }
    crate::license::require_sync(from.server_format(), to.server_format(), "Plugin sync")?;
    let plugin = find(from, id).await?;
    let source = plugin.path.clone().ok_or_else(|| format!("{} did not report where '{}' is installed.", from.id(), plugin.id))?;
    let bridge = bridge_dir(to)?;
    let report = stage_in_bridge(&bridge, &source, &plugin.name, to)?;

    let bridge_text = bridge.to_string_lossy().into_owned();
    let registered = marketplaces(to).await?.into_iter().find(|m| m.name == BRIDGE);
    match registered {
        Some(m) if m.source.as_deref() == Some(bridge_text.as_str()) => {
            if to == PluginClient::ClaudeCode {
                run(to, &["plugin", "marketplace", "update", BRIDGE]).await?;
            }
        }
        // Registered from somewhere else (an older layout): point it here.
        Some(_) => {
            run(to, &["plugin", "marketplace", "remove", BRIDGE]).await?;
            add_marketplace(to, &bridge_text).await?;
        }
        None => add_marketplace(to, &bridge_text).await?,
    }
    // A plugin already installed from the bridge is reinstalled to pick up the new copy.
    if list(to).await?.iter().any(|p| p.id == report.id) {
        uninstall(to, &report.id).await?;
    }
    install(to, &report.id).await?;
    Ok(report)
}

// Tauri commands for the app's Plugins page; `client` is `claude-code` or `codex`.

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_list(client: String) -> Result<Vec<Plugin>, String> {
    list(PluginClient::parse(&client)?).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_details(client: String, id: String) -> Result<PluginDetails, String> {
    details(PluginClient::parse(&client)?, &id).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_set_enabled(client: String, id: String, enabled: bool) -> Result<(), String> {
    set_enabled(PluginClient::parse(&client)?, &id, enabled).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_install(client: String, id: String) -> Result<(), String> {
    install(PluginClient::parse(&client)?, &id).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_uninstall(client: String, id: String) -> Result<(), String> {
    uninstall(PluginClient::parse(&client)?, &id).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_marketplaces(client: String) -> Result<Vec<Marketplace>, String> {
    marketplaces(PluginClient::parse(&client)?).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_add_marketplace(client: String, source: String) -> Result<(), String> {
    add_marketplace(PluginClient::parse(&client)?, &source).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_copy(from: String, to: String, id: String) -> Result<CopyReport, String> {
    copy(PluginClient::parse(&from)?, PluginClient::parse(&to)?, &id).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_both_clients_list_output() {
        let claude = json!([{ "id": "ios@mcp-linker", "version": "0.1.0", "scope": "user", "enabled": true, "installPath": "/c/ios" }]);
        let plugins = plugins_from_list(PluginClient::ClaudeCode, &claude);
        assert_eq!((plugins[0].name.as_str(), plugins[0].marketplace.as_str(), plugins[0].enabled), ("ios", "mcp-linker", true));
        assert_eq!(plugins[0].scope.as_deref(), Some("user"));

        let codex = json!({ "installed": [
            { "pluginId": "pdf@openai", "name": "pdf", "marketplaceName": "openai", "enabled": false, "installed": true, "source": { "path": "/x/pdf" } },
            { "pluginId": "gone@openai", "installed": false },
        ] });
        let plugins = plugins_from_list(PluginClient::Codex, &codex);
        assert_eq!(plugins.len(), 1);
        assert_eq!(plugins[0].path.as_deref(), Some(Path::new("/x/pdf")));
    }

    #[test]
    fn parses_plugin_clients() {
        assert_eq!(PluginClient::parse("cc"), Ok(PluginClient::ClaudeCode));
        assert_eq!(PluginClient::parse("codex"), Ok(PluginClient::Codex));
        assert!(PluginClient::parse("cursor").is_err());
    }

    fn write(path: &Path, text: &str) {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(path, text).unwrap();
    }

    #[test]
    fn stages_a_claude_code_plugin_for_codex() {
        let tmp = tempfile::tempdir().unwrap();
        let src = tmp.path().join("src");
        write(&src.join(".claude-plugin/plugin.json"), r#"{ "name": "ios", "version": "1.2.0", "description": "iOS pack", "author": { "name": "Me" } }"#);
        write(
            &src.join(".mcp.json"),
            r#"{ "mcpServers": { "sim": { "command": "${CLAUDE_PLUGIN_ROOT}/bin/sim", "args": [] }, "web": { "type": "http", "url": "https://w", "headers": { "A": "b" } } } }"#,
        );
        write(&src.join("skills/build/SKILL.md"), "---\nname: build\ndescription: Build the app\n---\nBody");
        write(&src.join("commands/run.md"), "x");

        let bridge = tmp.path().join("bridge");
        let report = stage_in_bridge(&bridge, &src, "ios", PluginClient::Codex).unwrap();
        assert_eq!(report.id, "ios@mcp-linker-bridge");
        assert_eq!(report.skills, ["build"]);
        assert_eq!(report.mcp_servers, ["sim", "web"]);
        assert_eq!(report.skipped, ["commands"]);

        let dest = bridge.join("plugins/ios");
        let manifest = read_json_file(&dest.join(".codex-plugin/plugin.json")).unwrap();
        assert_eq!(manifest["version"], "1.2.0");
        assert_eq!(manifest["skills"], "./skills/");
        assert_eq!(manifest["interface"]["developerName"], "Me");
        let mcp = read_json_file(&dest.join(".mcp.json")).unwrap();
        assert_eq!(mcp["mcpServers"]["web"]["http_headers"]["A"], "b");
        assert_eq!(mcp["mcpServers"]["sim"]["command"], format!("{}/bin/sim", src.display()));
        assert!(dest.join("skills/build/SKILL.md").exists());
        assert!(!dest.join("commands").exists());

        let codex_market = read_json_file(&bridge.join(".agents/plugins/marketplace.json")).unwrap();
        assert_eq!(codex_market["plugins"][0]["source"]["path"], "./plugins/ios");
        let claude_market = read_json_file(&bridge.join(".claude-plugin/marketplace.json")).unwrap();
        assert_eq!(claude_market["name"], BRIDGE);
    }

    #[test]
    fn stages_a_codex_plugin_for_claude_code() {
        let tmp = tempfile::tempdir().unwrap();
        let src = tmp.path().join("src");
        write(&src.join(".codex-plugin/plugin.json"), r#"{ "name": "pdf", "skills": "./skills/", "mcpServers": "./.mcp.json" }"#);
        write(&src.join(".mcp.json"), r#"{ "mcpServers": { "p": { "command": "node", "args": ["p.js"], "enabled_tools": ["x"] } } }"#);
        write(&src.join("skills/read/SKILL.md"), "---\nname: read-pdf\n---\n");

        let bridge = tmp.path().join("bridge");
        let report = stage_in_bridge(&bridge, &src, "pdf", PluginClient::ClaudeCode).unwrap();
        assert_eq!(report.skills, ["read-pdf"]);
        let dest = bridge.join("plugins/pdf");
        assert_eq!(read_json_file(&dest.join(".claude-plugin/plugin.json")).unwrap(), json!({ "name": "pdf" }));
        // Codex-only keys don't survive the conversion.
        assert_eq!(read_json_file(&dest.join(".mcp.json")).unwrap()["mcpServers"]["p"], json!({ "command": "node", "args": ["p.js"] }));
    }

    #[test]
    fn reads_inline_servers_and_skill_names_from_frontmatter() {
        let tmp = tempfile::tempdir().unwrap();
        let root = tmp.path();
        write(&root.join(".claude-plugin/plugin.json"), r#"{ "name": "x", "mcpServers": { "a": { "command": "a" } } }"#);
        write(&root.join("skills/one/SKILL.md"), "---\nname: \"First\"\ndescription: 'Does one'\n---\n");
        write(&root.join("skills/two/SKILL.md"), "no frontmatter");
        let PluginDir { servers, skills, .. } = read_dir(root);
        assert!(servers.contains_key("a"));
        let names: Vec<_> = skills.iter().map(|(s, _)| (s.name.as_str(), s.description.as_deref())).collect();
        assert_eq!(names, [("First", Some("Does one")), ("two", None)]);
    }
}
