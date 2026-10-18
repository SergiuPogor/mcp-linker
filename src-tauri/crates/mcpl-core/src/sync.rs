//! Converting a server entry from one client's format to another's, for sync.
//! Mirrors `src/components/manage/localSync.ts`; keep the two in step (the
//! tests below follow `localSync.test.ts`).

use serde_json::{Map, Value, json};

/// A server in client-neutral form; client-only keys (autoApprove, timeouts, …) do not survive.
#[derive(Debug, Clone, PartialEq)]
pub enum Portable {
    Stdio { command: String, args: Vec<String>, env: Option<Map<String, Value>>, cwd: Option<String> },
    Remote { sse: bool, url: String, headers: Option<Map<String, Value>> },
}

fn string_map(value: Option<&Value>) -> Option<Map<String, Value>> {
    let object = value?.as_object()?;
    let map: Map<String, Value> = object
        .iter()
        .map(|(k, v)| (k.clone(), Value::String(v.as_str().map_or_else(|| v.to_string(), str::to_string))))
        .collect();
    (!map.is_empty()).then_some(map)
}

// Claude Desktop only runs stdio servers, so remote ones are bridged through mcp-remote.
// Header values go through env vars, as mcp-remote's README recommends (spaces in args break on Windows).
const HEADER_ENV: &str = "MCP_REMOTE_HEADER_";

fn is_npx(command: &str) -> bool {
    let name = command.rsplit(['/', '\\']).next().unwrap_or(command);
    name == "npx" || name == "npx.cmd"
}

fn is_mcp_remote(arg: &str) -> bool {
    match arg.strip_prefix("mcp-remote") {
        Some("") => true,
        Some(version) => version
            .strip_prefix('@')
            .is_some_and(|v| !v.is_empty() && v.chars().all(|c| c.is_ascii_alphanumeric() || "_.-".contains(c))),
        None => false,
    }
}

fn expand_env(value: &str, env: &Map<String, Value>) -> String {
    let mut out = String::new();
    let mut rest = value;
    while let Some(start) = rest.find("${") {
        let Some(len) = rest[start + 2..].find('}') else { break };
        let name = &rest[start + 2..start + 2 + len];
        if name.is_empty() || !name.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
            out.push_str(&rest[..start + 2]);
            rest = &rest[start + 2..];
            continue;
        }
        out.push_str(&rest[..start]);
        out.push_str(env.get(name).and_then(Value::as_str).unwrap_or(""));
        rest = &rest[start + 3 + len..];
    }
    out.push_str(rest);
    out
}

fn unwrap_mcp_remote(command: &str, args: &[String], env: Option<&Map<String, Value>>) -> Option<Portable> {
    if !is_npx(command) {
        return None;
    }
    let rest: Vec<&str> = args.iter().map(String::as_str).filter(|a| *a != "-y" && *a != "--yes").collect();
    let url = *rest.get(1)?;
    if !is_mcp_remote(rest.first()?) || !(url.starts_with("http://") || url.starts_with("https://")) {
        return None;
    }
    let empty = Map::new();
    let env = env.unwrap_or(&empty);
    let mut sse = false;
    let mut headers = Map::new();
    for pair in rest[2..].chunks(2) {
        match (pair[0], pair.get(1).copied()) {
            ("--transport", Some(value @ ("sse-only" | "http-only"))) => sse = value == "sse-only",
            ("--header", Some(value)) if value.contains(':') => {
                let (name, header) = value.split_once(':').unwrap();
                headers.insert(name.trim().into(), Value::String(expand_env(header.trim(), env)));
            }
            // An option we can't carry over; keep the bridge as a plain stdio server.
            _ => return None,
        }
    }
    Some(Portable::Remote { sse, url: url.into(), headers: (!headers.is_empty()).then_some(headers) })
}

/// Reads any client's server entry (Cursor, VS Code, Cline, Codex, Claude Code, Claude Desktop, …).
pub fn to_portable(config: &Value) -> Result<Portable, String> {
    if let Some(command) = config.get("command").and_then(Value::as_str).filter(|c| !c.is_empty()) {
        let args: Vec<String> = config
            .get("args")
            .and_then(Value::as_array)
            .map(|args| args.iter().map(|a| a.as_str().map_or_else(|| a.to_string(), str::to_string)).collect())
            .unwrap_or_default();
        let env = string_map(config.get("env"));
        if let Some(bridged) = unwrap_mcp_remote(command, &args, env.as_ref()) {
            return Ok(bridged);
        }
        let cwd = config.get("cwd").and_then(Value::as_str).filter(|c| !c.is_empty()).map(str::to_string);
        return Ok(Portable::Stdio { command: command.into(), args, env, cwd });
    }
    let url = ["url", "serverUrl", "httpUrl"]
        .iter()
        .find_map(|key| config.get(*key))
        .and_then(Value::as_str)
        .filter(|url| !url.is_empty())
        .ok_or("Server has neither a command nor a url")?;
    let kind = config.get("type").or_else(|| config.get("transportType")).and_then(Value::as_str).unwrap_or("");
    let headers = string_map(config.get("headers").or_else(|| config.get("http_headers")));
    Ok(Portable::Remote { sse: kind.eq_ignore_ascii_case("sse"), url: url.into(), headers })
}

fn object(pairs: Vec<(&str, Option<Value>)>) -> Value {
    Value::Object(pairs.into_iter().filter_map(|(k, v)| v.map(|v| (k.to_string(), v))).collect())
}

/// Writes a server the way the target client expects it. `client` is an internal id (`clients.rs`).
pub fn from_portable(client: &str, server: &Portable) -> Value {
    match server {
        Portable::Stdio { command, args, env, cwd } => {
            let command = Some(json!(command));
            let args = Some(json!(args));
            let env = env.clone().map(Value::Object);
            let cwd = cwd.clone().map(Value::String);
            match client {
                "copilot" | "copilot_cli" => object(vec![("type", Some(json!("stdio"))), ("command", command), ("args", args), ("env", env), ("cwd", cwd)]),
                "codex" => object(vec![("type", Some(json!("stdio"))), ("command", command), ("args", args), ("env", env)]),
                "claude" | "claude_code" => object(vec![("command", command), ("args", args), ("env", env)]),
                _ => object(vec![("command", command), ("args", args), ("env", env), ("cwd", cwd)]),
            }
        }
        Portable::Remote { sse, url, headers } => {
            let transport = if *sse { "sse" } else { "http" };
            let header_value = headers.clone().map(Value::Object);
            match client {
                "claude" => {
                    let names: Vec<&String> = headers.iter().flat_map(|h| h.keys()).collect();
                    let mut args = vec![json!("-y"), json!("mcp-remote"), json!(url)];
                    if *sse {
                        args.extend([json!("--transport"), json!("sse-only")]);
                    }
                    for (i, name) in names.iter().enumerate() {
                        args.extend([json!("--header"), json!(format!("{name}:${{{HEADER_ENV}{i}}}"))]);
                    }
                    let env = (!names.is_empty()).then(|| {
                        let headers = headers.as_ref().unwrap();
                        Value::Object(names.iter().enumerate().map(|(i, n)| (format!("{HEADER_ENV}{i}"), headers[*n].clone())).collect())
                    });
                    object(vec![("command", Some(json!("npx"))), ("args", Some(Value::Array(args))), ("env", env)])
                }
                // Cline falls back to legacy SSE unless streamable HTTP is spelled exactly "streamableHttp".
                "cline" => object(vec![("type", Some(json!(if *sse { "sse" } else { "streamableHttp" }))), ("url", Some(json!(url))), ("headers", header_value)]),
                "codex" => object(vec![("type", Some(json!("http"))), ("url", Some(json!(url))), ("http_headers", header_value)]),
                "cursor" | "mcphub" => object(vec![("url", Some(json!(url))), ("headers", header_value)]),
                _ => object(vec![("type", Some(json!(transport))), ("url", Some(json!(url))), ("headers", header_value)]),
            }
        }
    }
}

/// Converts one client's server entry into another client's format.
pub fn convert_server(to_client: &str, config: &Value) -> Result<Value, String> {
    Ok(from_portable(to_client, &to_portable(config)?))
}

// Keys that say how to reach a server. A copy replaces these and keeps the
// target's other settings (autoApprove, disabled, timeouts, …).
const CONNECTION_KEYS: &[&str] = &["command", "args", "env", "cwd", "url", "serverUrl", "httpUrl", "type", "transportType", "headers", "http_headers"];

/// A copied server written over the target's entry of the same name.
pub fn merge_over(existing: Option<&Value>, converted: Value) -> Value {
    let Some(existing) = existing.and_then(Value::as_object) else { return converted };
    let mut merged: Map<String, Value> =
        existing.iter().filter(|(k, _)| !CONNECTION_KEYS.contains(&k.as_str())).map(|(k, v)| (k.clone(), v.clone())).collect();
    if let Value::Object(converted) = converted {
        merged.extend(converted);
    }
    Value::Object(merged)
}

/// True when two entries reach the same server, compared in client-neutral
/// form so the same server written two ways (e.g. an mcp-remote bridge and a
/// url) counts as equal.
pub fn same_server(a: &Value, b: &Value) -> bool {
    match (to_portable(a), to_portable(b)) {
        (Ok(a), Ok(b)) => a == b,
        _ => a == b,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn stdio() -> Value {
        json!({ "command": "npx", "args": ["-y", "pkg"], "env": { "KEY": "v" }, "autoApprove": ["x"], "disabled": false })
    }
    fn remote() -> Value {
        json!({ "url": "https://s", "headers": { "Authorization": "Bearer t" } })
    }
    fn convert(client: &str, config: &Value) -> Value {
        convert_server(client, config).unwrap()
    }

    #[test]
    fn drops_client_only_and_bookkeeping_keys_from_stdio_servers() {
        assert_eq!(convert("cursor", &stdio()), json!({ "command": "npx", "args": ["-y", "pkg"], "env": { "KEY": "v" } }));
    }

    #[test]
    fn adds_the_type_vs_code_copilot_cli_and_codex_need() {
        assert_eq!(convert("copilot", &stdio())["type"], "stdio");
        assert_eq!(convert("copilot", &remote()), json!({ "type": "http", "url": "https://s", "headers": { "Authorization": "Bearer t" } }));
        assert_eq!(convert("copilot_cli", &stdio())["type"], "stdio");
        assert_eq!(convert("codex", &stdio())["type"], "stdio");
    }

    #[test]
    fn spells_streamable_http_the_way_cline_requires() {
        assert_eq!(convert("cline", &remote())["type"], "streamableHttp");
        assert_eq!(convert("cline", &json!({ "type": "sse", "url": "https://s" }))["type"], "sse");
    }

    #[test]
    fn maps_codex_http_headers_both_ways() {
        assert_eq!(convert("codex", &remote()), json!({ "type": "http", "url": "https://s", "http_headers": { "Authorization": "Bearer t" } }));
        let codex = json!({ "type": "http", "url": "https://s", "http_headers": { "Authorization": "Bearer t" }, "enabled": false });
        assert_eq!(convert("cursor", &codex), remote());
    }

    #[test]
    fn reads_other_clients_url_keys_and_transport_spellings() {
        assert_eq!(convert("copilot", &json!({ "serverUrl": "https://a" })), json!({ "type": "http", "url": "https://a" }));
        assert_eq!(convert("copilot", &json!({ "httpUrl": "https://a" })), json!({ "type": "http", "url": "https://a" }));
        assert_eq!(convert("copilot", &json!({ "type": "streamableHttp", "url": "https://a" })), json!({ "type": "http", "url": "https://a" }));
        assert_eq!(convert("copilot", &json!({ "transportType": "sse", "url": "https://a" })), json!({ "type": "sse", "url": "https://a" }));
    }

    #[test]
    fn bridges_remote_servers_through_mcp_remote_for_claude_desktop() {
        assert_eq!(
            convert("claude", &remote()),
            json!({
                "command": "npx",
                "args": ["-y", "mcp-remote", "https://s", "--header", "Authorization:${MCP_REMOTE_HEADER_0}"],
                "env": { "MCP_REMOTE_HEADER_0": "Bearer t" },
            })
        );
        assert_eq!(
            convert("claude", &json!({ "type": "sse", "url": "https://a" }))["args"],
            json!(["-y", "mcp-remote", "https://a", "--transport", "sse-only"])
        );
    }

    #[test]
    fn unwraps_an_mcp_remote_bridge_back_into_a_remote_server() {
        assert_eq!(convert("cursor", &convert("claude", &remote())), remote());
        let pinned = json!({ "command": "npx", "args": ["mcp-remote@0.1.29", "https://a", "--transport", "sse-only"] });
        assert_eq!(convert("claude_code", &pinned), json!({ "type": "sse", "url": "https://a" }));
    }

    #[test]
    fn keeps_a_bridge_with_options_it_cannot_carry_as_a_stdio_server() {
        let bridge = json!({ "command": "npx", "args": ["-y", "mcp-remote", "https://a", "--allow-http"] });
        assert_eq!(convert("cursor", &bridge), bridge);
    }

    #[test]
    fn stringifies_non_string_env_values_and_keeps_cwd_where_supported() {
        assert_eq!(
            convert("cline", &json!({ "command": "node", "env": { "PORT": 3000 }, "cwd": "/srv" })),
            json!({ "command": "node", "args": [], "env": { "PORT": "3000" }, "cwd": "/srv" })
        );
        assert_eq!(convert("claude", &json!({ "command": "node", "cwd": "/srv" })), json!({ "command": "node", "args": [] }));
    }

    #[test]
    fn rejects_entries_with_neither_command_nor_url() {
        assert!(convert_server("cursor", &json!({ "type": "stdio" })).is_err());
    }

    #[test]
    fn merge_keeps_the_targets_other_settings() {
        let existing = json!({ "command": "old", "autoApprove": ["a"], "timeout": 5 });
        let merged = merge_over(Some(&existing), json!({ "url": "https://n" }));
        assert_eq!(merged, json!({ "autoApprove": ["a"], "timeout": 5, "url": "https://n" }));
        assert_eq!(merge_over(None, json!({ "url": "https://n" })), json!({ "url": "https://n" }));
    }

    #[test]
    fn the_same_server_written_by_another_client_is_the_same() {
        assert!(same_server(&convert("claude", &remote()), &json!({ "type": "http", "url": "https://s", "headers": { "Authorization": "Bearer t" } })));
        assert!(!same_server(&stdio(), &remote()));
    }
}
