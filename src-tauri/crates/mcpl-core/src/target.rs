//! One place to read and write a client's servers, whatever the client stores
//! them in. The `mcpl` CLI addresses a config as `CLIENT[:SCOPE][@PATH]`
//! (see docs/cli.md); this module parses that and dispatches to the
//! Claude Code, Codex or JSON code paths.

use crate::adapter::ClientAdapter;
use crate::claude_code_commands::{self as cc, ClaudeCodeServer, ClaudeMcpScope};
use crate::claude_disabled;
use crate::clients::{self, ClientInfo, Location, Storage};
use crate::json_commands;
use serde_json::{Map, Value};
use std::collections::HashMap;
use std::path::{Path, PathBuf};

/// Public, stable CLI ids for the internal ids in `clients.rs`.
const PUBLIC_IDS: &[(&str, &str)] = &[
    ("claude-desktop", "claude"),
    ("claude-code", "claude_code"),
    ("codex", "codex"),
    ("cursor", "cursor"),
    ("cline", "cline"),
    ("copilot", "copilot"),
    ("copilot-cli", "copilot_cli"),
    ("opencode", "opencode"),
    ("pi", "pi"),
    ("hermes", "hermes"),
    ("augment", "augment"),
    ("mcphub", "mcphub"),
    ("custom", "custom"),
];

const ALIASES: &[(&str, &str)] = &[("cc", "claude_code"), ("claude", "claude")];

/// The internal id for a CLI id or alias (`claude-code`, `cc`, `claude_code` all work).
pub fn internal_id(id: &str) -> Option<&'static str> {
    let id = id.trim().to_ascii_lowercase();
    PUBLIC_IDS
        .iter()
        .chain(ALIASES)
        .find(|(public, internal)| *public == id || *internal == id)
        .map(|(_, internal)| *internal)
}

/// The CLI id for an internal id.
pub fn public_id(internal: &str) -> &str {
    PUBLIC_IDS.iter().find(|(_, i)| *i == internal).map_or(internal, |(p, _)| *p)
}

/// Every client the CLI can address, in display order.
pub fn public_clients() -> impl Iterator<Item = (&'static str, &'static ClientInfo)> {
    PUBLIC_IDS.iter().filter_map(|(public, internal)| clients::find(internal).map(|c| (*public, c)))
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Scope {
    User,
    Project,
    Local,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Target {
    ClaudeCode { scope: ClaudeMcpScope, dir: PathBuf },
    Codex,
    /// A JSON/YAML client. `path` is the project directory for project scope,
    /// the file for `custom`, and `None` for the user config.
    Json { client: &'static str, path: Option<PathBuf> },
}

fn absolute(path: &str, cwd: &Path) -> PathBuf {
    let path = match path.strip_prefix("~/") {
        Some(rest) => dirs::home_dir().map_or_else(|| PathBuf::from(path), |home| home.join(rest)),
        None => PathBuf::from(path),
    };
    if path.is_absolute() { path } else { cwd.join(path) }
}

impl Target {
    /// Parses `CLIENT[:SCOPE][@PATH]`. Relative paths and a missing project
    /// directory resolve against `cwd`.
    pub fn parse(spec: &str, cwd: &Path) -> Result<Self, String> {
        let (head, path) = match spec.split_once('@') {
            Some((head, path)) => (head, Some(path).filter(|p| !p.is_empty())),
            None => (spec, None),
        };
        let (id, scope) = match head.split_once(':') {
            Some((id, scope)) => (id, Some(scope)),
            None => (head, None),
        };
        let client = internal_id(id).ok_or_else(|| format!("Unknown client '{id}'. Run `mcpl clients` to list them."))?;
        let info = clients::find(client).ok_or_else(|| format!("Unknown client '{id}'"))?;
        let scope = match scope.map(str::to_ascii_lowercase).as_deref() {
            None | Some("") => None,
            Some("user") => Some(Scope::User),
            Some("project") => Some(Scope::Project),
            Some("local") => Some(Scope::Local),
            Some(other) => return Err(format!("Unknown scope '{other}'. Use user, project or local.")),
        };
        let dir = || path.map_or_else(|| cwd.to_path_buf(), |p| absolute(p, cwd));
        match info.storage {
            Storage::ClaudeCode => {
                let scope = match scope.unwrap_or(Scope::Local) {
                    Scope::User => ClaudeMcpScope::User,
                    Scope::Project => ClaudeMcpScope::Project,
                    Scope::Local => ClaudeMcpScope::Local,
                };
                Ok(Target::ClaudeCode { scope, dir: dir() })
            }
            Storage::CodexToml => match (scope, path) {
                (None | Some(Scope::User), None) => Ok(Target::Codex),
                _ => Err("Codex has a single user config; drop the scope and path.".into()),
            },
            Storage::Json => match (info.location, scope) {
                (_, Some(Scope::Local)) => Err(format!("{} has no local scope.", info.label)),
                (Location::File, _) => {
                    let file = path.ok_or("custom needs a file: custom@./mcp.json")?;
                    Ok(Target::Json { client, path: Some(absolute(file, cwd)) })
                }
                (Location::UserOrProject, Some(Scope::Project)) => Ok(Target::Json { client, path: Some(dir()) }),
                (Location::UserOrProject, None) if path.is_some() => Ok(Target::Json { client, path: Some(dir()) }),
                (_, Some(Scope::Project)) => Err(format!("{} has no project config.", info.label)),
                (_, _) if path.is_some() => Err(format!("{} has a fixed config location; drop @PATH.", info.label)),
                _ => Ok(Target::Json { client, path: None }),
            },
        }
    }

    /// The internal client id, as `clients.rs` and `sync.rs` use it.
    pub fn client_id(&self) -> &'static str {
        match self {
            Target::ClaudeCode { .. } => "claude_code",
            Target::Codex => "codex",
            Target::Json { client, .. } => client,
        }
    }

    /// A short human description, e.g. `claude-code:local@/work/app`.
    pub fn describe(&self) -> String {
        match self {
            Target::ClaudeCode { scope: ClaudeMcpScope::User, .. } => "claude-code:user".into(),
            Target::ClaudeCode { scope, dir } => {
                let scope = if *scope == ClaudeMcpScope::Project { "project" } else { "local" };
                format!("claude-code:{scope}@{}", dir.display())
            }
            Target::Codex => "codex".into(),
            Target::Json { client, path: Some(path) } if *client == "custom" => format!("custom@{}", path.display()),
            Target::Json { client, path: Some(path) } => format!("{}:project@{}", public_id(client), path.display()),
            Target::Json { client, path: None } => public_id(client).into(),
        }
    }

    /// The config file this target reads and writes.
    pub fn config_path(&self) -> Result<PathBuf, String> {
        match self {
            Target::ClaudeCode { scope: ClaudeMcpScope::Project, dir } => Ok(dir.join(".mcp.json")),
            Target::ClaudeCode { .. } => Ok(dirs::home_dir().ok_or("Home directory unavailable")?.join(".claude.json")),
            Target::Codex => crate::config::get_config_path(),
            Target::Json { client, path } => {
                Ok(crate::client::ClientConfig::new(client, path.as_deref().and_then(Path::to_str))?.get_path().to_path_buf())
            }
        }
    }

    fn dir(&self) -> String {
        match self {
            Target::ClaudeCode { scope: ClaudeMcpScope::User, .. } => String::new(),
            Target::ClaudeCode { dir, .. } => dir.to_string_lossy().into_owned(),
            _ => String::new(),
        }
    }

    fn scope(&self) -> Option<ClaudeMcpScope> {
        match self {
            Target::ClaudeCode { scope, .. } => Some(*scope),
            _ => None,
        }
    }

    fn path_arg(&self) -> Option<String> {
        match self {
            Target::Json { path, .. } => path.as_ref().map(|p| p.to_string_lossy().into_owned()),
            _ => None,
        }
    }

    fn adapter_path(&self) -> Option<&str> {
        match self {
            Target::Json { path, .. } => path.as_deref().and_then(Path::to_str),
            _ => None,
        }
    }

    /// Enabled servers, by name, in the client's own format.
    pub async fn servers(&self) -> Result<Map<String, Value>, String> {
        match self {
            Target::ClaudeCode { .. } => {
                let mut servers = Map::new();
                for server in cc::claude_mcp_list(self.dir(), self.scope()).await? {
                    servers.insert(server.name.clone(), cc::server_to_json(&server)?);
                }
                for name in self.disabled().await?.keys() {
                    servers.remove(name);
                }
                Ok(servers)
            }
            _ => {
                let json = json_commands::read_json_file(self.client_id().into(), self.path_arg()).await?;
                Ok(json.get("mcpServers").and_then(Value::as_object).cloned().unwrap_or_default())
            }
        }
    }

    /// Disabled servers, by name. Claude Code only tracks them in local scope.
    pub async fn disabled(&self) -> Result<Map<String, Value>, String> {
        let value = match self {
            Target::ClaudeCode { scope: ClaudeMcpScope::Local, .. } => {
                claude_disabled::claude_list_disabled(self.dir(), self.scope()).await?
            }
            Target::ClaudeCode { .. } => return Ok(Map::new()),
            _ => ClientAdapter::new(self.client_id(), self.adapter_path()).list_disabled().await?,
        };
        Ok(value.as_object().cloned().unwrap_or_default())
    }

    /// Adds `name`, or replaces its entry when it exists.
    pub async fn put(&self, name: &str, config: Value) -> Result<(), String> {
        match self {
            Target::ClaudeCode { .. } => {
                let request = claude_request(name, &config)?;
                cc::claude_mcp_add(request, self.dir(), self.scope()).await?;
            }
            _ => {
                let adapter = ClientAdapter::new(self.client_id(), self.adapter_path());
                if self.servers().await?.contains_key(name) {
                    adapter.update(name.into(), config).await?;
                } else if self.disabled().await?.contains_key(name) {
                    adapter.update_disabled(name.into(), config).await?;
                } else {
                    adapter.add(name.into(), config).await?;
                }
            }
        }
        Ok(())
    }

    pub async fn remove(&self, name: &str) -> Result<(), String> {
        match self {
            Target::ClaudeCode { .. } => {
                cc::claude_mcp_remove(name.into(), self.dir(), self.scope()).await?;
            }
            _ => {
                ClientAdapter::new(self.client_id(), self.adapter_path()).remove(name.into()).await?;
            }
        }
        Ok(())
    }

    pub async fn set_enabled(&self, name: &str, enabled: bool) -> Result<(), String> {
        match (self, enabled) {
            (Target::ClaudeCode { .. }, true) => {
                claude_disabled::claude_enable_server(self.dir(), name.into(), self.scope()).await?;
            }
            (Target::ClaudeCode { .. }, false) => {
                claude_disabled::claude_disable_server(self.dir(), name.into(), self.scope()).await?;
            }
            (_, true) => {
                ClientAdapter::new(self.client_id(), self.adapter_path()).enable(name.into()).await?;
            }
            (_, false) => {
                ClientAdapter::new(self.client_id(), self.adapter_path()).disable(name.into()).await?;
            }
        }
        Ok(())
    }
}

fn string_map(value: Option<&Value>) -> Option<HashMap<String, String>> {
    let object = value?.as_object()?;
    Some(object.iter().map(|(k, v)| (k.clone(), v.as_str().map_or_else(|| v.to_string(), str::to_string))).collect())
}

/// Maps a client config to Claude Code's add request (`toClaudeRequest` in src/lib/claude.ts).
fn claude_request(name: &str, value: &Value) -> Result<ClaudeCodeServer, String> {
    let text = |key: &str| value.get(key).and_then(Value::as_str).map(str::to_string);
    if let Some(command) = text("command") {
        let args = value
            .get("args")
            .and_then(Value::as_array)
            .map(|args| args.iter().map(|a| a.as_str().map_or_else(|| a.to_string(), str::to_string)).collect());
        return Ok(ClaudeCodeServer {
            name: name.into(),
            r#type: "stdio".into(),
            url: None,
            command: Some(command),
            args: Some(args.unwrap_or_default()),
            env: string_map(value.get("env")),
            headers: None,
        });
    }
    let url = text("url").or_else(|| text("serverUrl")).or_else(|| text("httpUrl")).ok_or("Unsupported config for Claude Code")?;
    Ok(ClaudeCodeServer {
        name: name.into(),
        // claude_mcp_add normalizes streamable-http spellings to "http".
        r#type: text("type").unwrap_or_else(|| "http".into()),
        url: Some(url),
        command: None,
        args: None,
        env: None,
        headers: string_map(value.get("headers")),
    })
}

/// Clients whose config file exists on this machine, at their user location.
pub fn detected() -> Vec<Target> {
    let cwd = std::env::current_dir().unwrap_or_default();
    public_clients()
        .filter(|(_, info)| info.location != Location::File)
        .filter_map(|(public, info)| {
            let target = if info.storage == Storage::ClaudeCode {
                Target::ClaudeCode { scope: ClaudeMcpScope::User, dir: cwd.clone() }
            } else {
                Target::parse(public, &cwd).ok()?
            };
            target.config_path().ok().filter(|p| p.exists()).map(|_| target)
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parse(spec: &str) -> Result<Target, String> {
        Target::parse(spec, Path::new("/work/app"))
    }

    #[test]
    fn every_public_id_names_a_client() {
        for (public, internal) in PUBLIC_IDS {
            assert!(clients::find(internal).is_some(), "{public}");
        }
        let listed: Vec<_> = clients::list_clients().into_iter().map(|c| c.id).collect();
        for id in listed {
            assert!(PUBLIC_IDS.iter().any(|(_, i)| *i == id), "{id} has no CLI id");
        }
    }

    #[test]
    fn accepts_public_ids_internal_ids_and_aliases() {
        assert_eq!(internal_id("claude-code"), Some("claude_code"));
        assert_eq!(internal_id("CC"), Some("claude_code"));
        assert_eq!(internal_id("claude_code"), Some("claude_code"));
        assert_eq!(internal_id("claude"), Some("claude"));
        assert_eq!(internal_id("copilot_cli"), Some("copilot_cli"));
        assert_eq!(internal_id("nope"), None);
    }

    #[test]
    fn claude_code_defaults_to_local_scope_in_the_current_directory() {
        assert_eq!(parse("claude-code"), Ok(Target::ClaudeCode { scope: ClaudeMcpScope::Local, dir: "/work/app".into() }));
        assert_eq!(parse("cc:project@sub"), Ok(Target::ClaudeCode { scope: ClaudeMcpScope::Project, dir: "/work/app/sub".into() }));
        assert_eq!(parse("cc:user").unwrap().describe(), "claude-code:user");
    }

    #[test]
    fn json_clients_take_a_project_where_they_have_one() {
        assert_eq!(parse("cursor"), Ok(Target::Json { client: "cursor", path: None }));
        assert_eq!(parse("cursor:project"), Ok(Target::Json { client: "cursor", path: Some("/work/app".into()) }));
        assert_eq!(parse("cursor@/other"), Ok(Target::Json { client: "cursor", path: Some("/other".into()) }));
        assert!(parse("claude-desktop:project").is_err());
        assert!(parse("claude-desktop@/x").is_err());
        assert!(parse("cursor:local").is_err());
    }

    #[test]
    fn custom_needs_a_file_and_codex_takes_nothing() {
        assert_eq!(parse("custom@mcp.json"), Ok(Target::Json { client: "custom", path: Some("/work/app/mcp.json".into()) }));
        assert!(parse("custom").is_err());
        assert_eq!(parse("codex"), Ok(Target::Codex));
        assert!(parse("codex:project").is_err());
    }

    #[test]
    fn maps_configs_to_claude_code_requests() {
        let stdio = claude_request("a", &serde_json::json!({ "command": "npx", "args": ["-y", "pkg"], "env": { "K": "v" } })).unwrap();
        assert_eq!((stdio.r#type.as_str(), stdio.command.as_deref()), ("stdio", Some("npx")));
        let remote = claude_request("b", &serde_json::json!({ "type": "sse", "url": "https://s" })).unwrap();
        assert_eq!((remote.r#type.as_str(), remote.url.as_deref()), ("sse", Some("https://s")));
        assert!(claude_request("c", &serde_json::json!({})).is_err());
    }
}
