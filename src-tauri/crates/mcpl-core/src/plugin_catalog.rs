//! What a client's plugins look like on disk: the marketplaces it knows, the
//! plugins they offer and which of those are installed and enabled.
//!
//! Read from the clients' own files (`~/.claude/plugins`, `~/.codex`) instead of
//! `claude plugin list` / `codex plugin list`: that is instant, works offline
//! and also covers marketplaces whose plugins are not installed yet, which the
//! CLIs only list slowly (Codex) or not at all (Claude Code).

use crate::plugins::{Marketplace, PluginClient};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::time::SystemTime;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogEntry {
    /// `name@marketplace`.
    pub id: String,
    pub name: String,
    pub display_name: Option<String>,
    pub marketplace: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub version: Option<String>,
    pub homepage: Option<String>,
    /// From the client vendor's own marketplace, as opposed to one the user added.
    pub official: bool,
    /// Submitted by someone else to MCP Linker's marketplace: an external source, not one of its own packs.
    pub community: bool,
    /// One of MCP Linker's own packs: a local entry of its marketplace.
    pub curated: bool,
    pub installed: bool,
    pub enabled: bool,
    /// Claude Code's install scope (`user`, `project`, `local`).
    pub scope: Option<String>,
    /// The plugin's directory: the installed copy, else its source in the marketplace.
    pub path: Option<PathBuf>,
    pub icon: Option<PathBuf>,
    /// A logo that lives on the web (Codex's remote catalog).
    pub icon_url: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Catalog {
    pub plugins: Vec<CatalogEntry>,
    pub marketplaces: Vec<Marketplace>,
}

fn read_json(path: &Path) -> Option<Value> {
    std::fs::read_to_string(path).ok().and_then(|text| serde_json::from_str(&text).ok())
}

fn read_toml(path: &Path) -> Option<toml::Table> {
    std::fs::read_to_string(path).ok().and_then(|text| text.parse().ok())
}

fn text(value: Option<&Value>) -> Option<String> {
    value.and_then(Value::as_str).filter(|s| !s.is_empty()).map(str::to_string)
}

/// A marketplace the client knows, with the directory it was checked out to.
struct Market {
    info: Marketplace,
    root: Option<PathBuf>,
    official: bool,
    /// MCP Linker's own marketplace (`milisp/mcp-linker`).
    linker: bool,
}

fn claude_markets(home: &Path) -> Vec<Market> {
    let dir = home.join(".claude/plugins");
    let known = read_json(&dir.join("known_marketplaces.json"));
    let mut markets: Vec<Market> = match known {
        Some(Value::Object(known)) => known
            .iter()
            .map(|(name, row)| {
                let source = ["repo", "url", "path"].iter().find_map(|key| text(row.pointer(&format!("/source/{key}"))));
                market(name, source, text(row.get("installLocation")).map(PathBuf::from))
            })
            .collect(),
        _ => Vec::new(),
    };
    // Claude Code's built-in `claude-plugins-official` is checked out but not listed.
    for entry in std::fs::read_dir(dir.join("marketplaces")).into_iter().flatten().flatten() {
        let name = entry.file_name().to_string_lossy().into_owned();
        if entry.path().is_dir() && !markets.iter().any(|m| m.info.name == name) {
            markets.push(market(&name, None, Some(entry.path())));
        }
    }
    markets
}

fn market(name: &str, source: Option<String>, root: Option<PathBuf>) -> Market {
    let manifest = root.as_ref().and_then(|r| read_json(&r.join(".claude-plugin/marketplace.json")));
    let email = manifest.as_ref().and_then(|m| text(m.pointer("/owner/email"))).unwrap_or_default();
    Market {
        official: name == "claude-plugins-official" || email.ends_with("@anthropic.com"),
        linker: is_linker(name, source.as_deref()),
        info: Marketplace { name: name.to_string(), source, location: root.clone() },
        root,
    }
}

fn is_linker(name: &str, source: Option<&str>) -> bool {
    name == "mcp-linker" || source.is_some_and(|s| s.contains("milisp/mcp-linker"))
}

fn codex_markets(home: &Path) -> Vec<Market> {
    let config = read_toml(&home.join(".codex/config.toml")).unwrap_or_default();
    let Some(toml::Value::Table(markets)) = config.get("marketplaces") else { return Vec::new() };
    markets
        .iter()
        .map(|(name, row)| {
            let source = row.get("source").and_then(toml::Value::as_str).map(str::to_string);
            let local = row.get("source_type").and_then(toml::Value::as_str) == Some("local");
            let root = match (&source, local) {
                (Some(path), true) => Some(PathBuf::from(path)),
                // Git marketplaces are checked out here by Codex.
                _ => Some(home.join(".codex/.tmp/marketplaces").join(name)).filter(|p| p.is_dir()),
            };
            let linker = is_linker(name, source.as_deref());
            Market { official: name.starts_with("openai-"), linker, info: Marketplace { name: name.clone(), source, location: root.clone() }, root }
        })
        .collect()
}

/// What the client says is installed: id → (scope, directory, version).
type Installed = Vec<(String, Option<String>, Option<PathBuf>, Option<String>)>;

fn claude_installed(home: &Path) -> Installed {
    let file = read_json(&home.join(".claude/plugins/installed_plugins.json"));
    let Some(Value::Object(plugins)) = file.as_ref().and_then(|f| f.get("plugins")) else { return Vec::new() };
    plugins
        .iter()
        .filter_map(|(id, installs)| {
            let installs = installs.as_array()?;
            // Several scopes may hold the same plugin; the user's own wins.
            let install = installs.iter().find(|i| i.get("scope").and_then(Value::as_str) == Some("user")).or(installs.first())?;
            Some((id.clone(), text(install.get("scope")), text(install.get("installPath")).map(PathBuf::from), text(install.get("version"))))
        })
        .collect()
}

fn claude_enabled(home: &Path, id: &str) -> bool {
    read_json(&home.join(".claude/settings.json"))
        .and_then(|settings| settings.pointer("/enabledPlugins").and_then(|p| p.get(id)).and_then(Value::as_bool))
        .unwrap_or(false)
}

/// Codex keeps each install in `plugins/cache/<marketplace>/<name>/<version>`.
fn codex_installed(home: &Path, config: &toml::Table) -> Installed {
    let mut ids: Vec<String> = Vec::new();
    if let Some(toml::Value::Table(plugins)) = config.get("plugins") {
        ids.extend(plugins.keys().cloned());
    }
    let cache = home.join(".codex/plugins/cache");
    for market in std::fs::read_dir(&cache).into_iter().flatten().flatten() {
        for plugin in std::fs::read_dir(market.path()).into_iter().flatten().flatten() {
            let id = format!("{}@{}", plugin.file_name().to_string_lossy(), market.file_name().to_string_lossy());
            if !ids.contains(&id) {
                ids.push(id);
            }
        }
    }
    ids.into_iter()
        .filter_map(|id| {
            let (name, market) = id.split_once('@')?;
            let versions = cache.join(market).join(name);
            let mut dirs: Vec<PathBuf> = std::fs::read_dir(&versions).into_iter().flatten().flatten().map(|e| e.path()).filter(|p| p.is_dir()).collect();
            dirs.sort();
            let path = dirs.pop();
            // A config entry whose files are gone is not installed.
            path.as_ref()?;
            let version = path.as_ref().and_then(|p| p.file_name()).map(|v| v.to_string_lossy().into_owned());
            Some((id, None, path, version))
        })
        .collect()
}

fn codex_enabled(config: &toml::Table, id: &str) -> bool {
    config
        .get("plugins")
        .and_then(|p| p.get(id))
        .and_then(|p| p.get("enabled"))
        .and_then(toml::Value::as_bool)
        .unwrap_or(false)
}

fn manifest_of(dir: &Path) -> Option<Value> {
    read_json(&dir.join(".claude-plugin/plugin.json")).or_else(|| read_json(&dir.join(".codex-plugin/plugin.json")))
}

/// A plugin's logo, from Codex's `interface` or the usual file names.
fn icon_of(dir: &Path, manifest: Option<&Value>) -> Option<PathBuf> {
    let declared = ["logo", "composerIcon", "icon"].iter().find_map(|key| {
        text(manifest.and_then(|m| m.pointer(&format!("/interface/{key}"))).or_else(|| manifest.and_then(|m| m.get(*key))))
    });
    let declared = declared.map(|rel| dir.join(rel.trim_start_matches("./")));
    declared.into_iter().chain(["icon.png", "logo.png", "icon.svg", "logo.svg", "assets/icon.png", "assets/logo.png"].map(|f| dir.join(f))).find(|p| p.is_file())
}

/// Whether a marketplace row's `source` lives in the marketplace itself, as MCP Linker's own packs do.
fn is_local_source(source: Option<&Value>) -> bool {
    match source {
        Some(Value::String(_)) => true,
        Some(Value::Object(map)) => map.get("source").and_then(Value::as_str) == Some("local"),
        _ => false,
    }
}

/// The directory a marketplace row's `source` points at, when it is inside the marketplace.
fn source_dir(root: &Path, source: Option<&Value>) -> Option<PathBuf> {
    let rel = match source? {
        Value::String(path) => path.clone(),
        Value::Object(map) if map.get("source").and_then(Value::as_str) == Some("local") => map.get("path")?.as_str()?.to_string(),
        _ => return None,
    };
    Some(root.join(rel.trim_start_matches("./"))).filter(|p| p.is_dir())
}

fn market_rows(client: PluginClient, root: &Path) -> Vec<Value> {
    let paths = match client {
        PluginClient::ClaudeCode => [".claude-plugin/marketplace.json", ".agents/plugins/marketplace.json"],
        PluginClient::Codex => [".agents/plugins/marketplace.json", ".claude-plugin/marketplace.json"],
    };
    paths
        .iter()
        .find_map(|rel| read_json(&root.join(rel)))
        .and_then(|m| m.get("plugins").and_then(Value::as_array).cloned())
        .unwrap_or_default()
}

/// The marketplace name Codex gives its ChatGPT-backed catalog.
const REMOTE_MARKET: &str = "openai-curated-remote";

#[derive(Deserialize)]
struct RemoteFile {
    #[serde(default)]
    plugins: Vec<RemotePlugin>,
}

#[derive(Deserialize)]
struct RemotePlugin {
    name: String,
    discoverability: Option<String>,
    status: Option<String>,
    release: Option<RemoteRelease>,
}

#[derive(Deserialize)]
struct RemoteRelease {
    version: Option<String>,
    display_name: Option<String>,
    description: Option<String>,
    interface: Option<RemoteInterface>,
}

#[derive(Deserialize)]
struct RemoteInterface {
    short_description: Option<String>,
    category: Option<String>,
    website_url: Option<String>,
    logo_url: Option<String>,
    composer_icon_url: Option<String>,
}

/// The parsed remote catalog by file modification time; the file is tens of MB.
static REMOTE_CACHE: Mutex<Option<(SystemTime, Vec<CatalogEntry>)>> = Mutex::new(None);

/// Codex's ChatGPT-backed catalog (thousands of plugins), as `codex plugin list`
/// last cached it in `~/.codex/cache/remote_plugin_catalog`. Empty until Codex
/// has fetched it once while signed in with ChatGPT.
fn codex_remote(home: &Path) -> Vec<CatalogEntry> {
    let dir = home.join(".codex/cache/remote_plugin_catalog");
    let newest = std::fs::read_dir(dir)
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|e| Some((e.metadata().ok()?, e.path())))
        .max_by_key(|(meta, _)| meta.len());
    let Some((meta, path)) = newest else { return Vec::new() };
    let modified = meta.modified().unwrap_or(SystemTime::UNIX_EPOCH);
    if let Ok(cache) = REMOTE_CACHE.lock() {
        if let Some((at, entries)) = cache.as_ref() {
            if *at == modified {
                return entries.clone();
            }
        }
    }
    let Some(file) = std::fs::read(&path).ok().and_then(|bytes| serde_json::from_slice::<RemoteFile>(&bytes).ok()) else { return Vec::new() };
    let entries: Vec<CatalogEntry> = file
        .plugins
        .into_iter()
        .filter(|p| p.discoverability.as_deref() == Some("LISTED") && p.status.as_deref() == Some("AVAILABLE"))
        .map(|p| {
            let release = p.release;
            let interface = release.as_ref().and_then(|r| r.interface.as_ref());
            let pick = |v: Option<&String>| v.filter(|s| !s.is_empty()).cloned();
            CatalogEntry {
                id: format!("{}@{REMOTE_MARKET}", p.name),
                display_name: pick(release.as_ref().and_then(|r| r.display_name.as_ref())),
                description: pick(interface.and_then(|i| i.short_description.as_ref())).or_else(|| pick(release.as_ref().and_then(|r| r.description.as_ref()))),
                category: pick(interface.and_then(|i| i.category.as_ref())),
                version: pick(release.as_ref().and_then(|r| r.version.as_ref())),
                homepage: pick(interface.and_then(|i| i.website_url.as_ref())),
                icon_url: pick(interface.and_then(|i| i.logo_url.as_ref()).or_else(|| interface.and_then(|i| i.composer_icon_url.as_ref()))),
                marketplace: REMOTE_MARKET.into(),
                name: p.name,
                official: true,
                community: false,
                curated: false,
                installed: false,
                enabled: false,
                scope: None,
                path: None,
                icon: None,
            }
        })
        .collect();
    if let Ok(mut cache) = REMOTE_CACHE.lock() {
        *cache = Some((modified, entries.clone()));
    }
    entries
}

pub fn catalog_at(client: PluginClient, home: &Path) -> Catalog {
    let config = read_toml(&home.join(".codex/config.toml")).unwrap_or_default();
    let (markets, installed) = match client {
        PluginClient::ClaudeCode => (claude_markets(home), claude_installed(home)),
        PluginClient::Codex => (codex_markets(home), codex_installed(home, &config)),
    };
    let installed_of = |id: &str| installed.iter().find(|(i, ..)| i == id);
    let enabled = |id: &str| match client {
        PluginClient::ClaudeCode => claude_enabled(home, id),
        PluginClient::Codex => codex_enabled(&config, id),
    };

    let mut plugins: Vec<CatalogEntry> = Vec::new();
    let build = |id: String, name: String, market: &str, official: bool, community: bool, curated: bool, row: Option<&Value>, source: Option<PathBuf>| {
        let install = installed_of(&id);
        let path = install.and_then(|(_, _, path, _)| path.clone()).or(source);
        // Reading every manifest of a big marketplace is wasted work; installed plugins and Codex's `interface` need it.
        let manifest = path.as_deref().filter(|_| install.is_some() || client == PluginClient::Codex).and_then(manifest_of);
        let interface = |key: &str| text(manifest.as_ref().and_then(|m| m.pointer(&format!("/interface/{key}"))));
        let field = |key: &str| text(row.and_then(|r| r.get(key))).or_else(|| text(manifest.as_ref().and_then(|m| m.get(key))));
        CatalogEntry {
            icon: path.as_deref().and_then(|dir| icon_of(dir, manifest.as_ref())),
            icon_url: None,
            display_name: interface("displayName").or_else(|| field("displayName")),
            description: interface("shortDescription").or_else(|| field("description")),
            category: interface("category").or_else(|| field("category")),
            version: install.and_then(|(_, _, _, v)| v.clone()).or_else(|| field("version")),
            homepage: field("homepage"),
            scope: install.and_then(|(_, scope, ..)| scope.clone()),
            installed: install.is_some(),
            enabled: install.is_some() && enabled(&id),
            marketplace: market.to_string(),
            official,
            community,
            curated,
            path,
            name,
            id,
        }
    };

    for market in &markets {
        let Some(root) = &market.root else { continue };
        for row in market_rows(client, root) {
            let Some(name) = text(row.get("name")) else { continue };
            let id = format!("{name}@{}", market.info.name);
            if plugins.iter().any(|p| p.id == id) {
                continue;
            }
            let source = source_dir(root, row.get("source"));
            let local = is_local_source(row.get("source"));
            plugins.push(build(id, name, &market.info.name, market.official, market.linker && !local, market.linker && local, Some(&row), source));
        }
    }
    // Installed from a marketplace that has since gone (or never listed it).
    for (id, ..) in &installed {
        if plugins.iter().any(|p| &p.id == id) {
            continue;
        }
        let (name, market) = id.split_once('@').unwrap_or((id, ""));
        let official = markets.iter().find(|m| m.info.name == market).is_some_and(|m| m.official) || (client == PluginClient::Codex && market.starts_with("openai-"));
        plugins.push(build(id.clone(), name.to_string(), market, official, false, false, None, None));
    }
    if client == PluginClient::Codex {
        for remote in codex_remote(home) {
            // An installed copy already listed (from the cache directory) keeps its local data, gaining the remote's logo.
            match plugins.iter_mut().find(|p| p.id == remote.id) {
                Some(existing) => {
                    existing.icon_url = existing.icon_url.take().or(remote.icon_url);
                    existing.display_name = existing.display_name.take().or(remote.display_name);
                    existing.description = existing.description.take().or(remote.description);
                    existing.category = existing.category.take().or(remote.category);
                }
                None => plugins.push(remote),
            }
        }
    }
    Catalog { plugins, marketplaces: markets.into_iter().map(|m| m.info).collect() }
}

pub fn catalog(client: PluginClient) -> Result<Catalog, String> {
    let home = dirs::home_dir().ok_or("Unable to find the home directory.")?;
    Ok(catalog_at(client, &home))
}

/// An image file as a `data:` URL, so the webview can show it without file access.
pub fn icon_data_url(path: &Path) -> Option<String> {
    use base64::Engine;
    let mime = match path.extension()?.to_str()?.to_ascii_lowercase().as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "svg" => "image/svg+xml",
        "webp" => "image/webp",
        _ => return None,
    };
    let bytes = std::fs::read(path).ok().filter(|b| b.len() <= 512 * 1024)?;
    Some(format!("data:{mime};base64,{}", base64::engine::general_purpose::STANDARD.encode(bytes)))
}

/// Where logos are fetched from, as (host, path prefix): Codex's plugin catalog, GitHub, and this repo's own icons on jsDelivr. A logo anywhere else stays a letter tile.
const ICON_SOURCES: [(&str, &str); 5] = [
    ("files.openai.com", "/"),
    ("chatgpt.com", "/"),
    ("avatars.githubusercontent.com", "/"),
    ("raw.githubusercontent.com", "/"),
    ("cdn.jsdelivr.net", "/gh/milisp/mcp-linker@"),
];
const MAX_ICON_BYTES: usize = 256 * 1024;

/// A few at a time, so a page of plugins doesn't open a page of connections.
static ICON_FETCHES: tokio::sync::Semaphore = tokio::sync::Semaphore::const_new(4);

/// `url` if logos may be fetched from it: https, a listed host and path, no credentials, no port.
fn allowed_icon_url(url: &str) -> Option<url::Url> {
    let parsed = url::Url::parse(url).ok()?;
    let listed = parsed.host_str().is_some_and(|host| ICON_SOURCES.iter().any(|(h, prefix)| *h == host && parsed.path().starts_with(prefix)));
    let ok = parsed.scheme() == "https" && parsed.username().is_empty() && parsed.password().is_none() && parsed.port().is_none() && listed;
    ok.then_some(parsed)
}

/// Whether the bytes are a drawing and nothing else: no script, no embedded page or image, no event handlers, no outside references. It is shown in an `<img>`, where none of that runs anyway.
fn plain_svg(bytes: &[u8]) -> bool {
    let Ok(text) = std::str::from_utf8(bytes) else { return false };
    let text = text.to_ascii_lowercase();
    let body = text.trim_start_matches('\u{feff}').trim_start();
    if !(body.starts_with("<svg") || body.starts_with("<?xml") || body.starts_with("<!--") || body.starts_with("<!doctype svg")) || !text.contains("<svg") {
        return false;
    }
    const BANNED: [&str; 10] = ["<script", "<foreignobject", "<iframe", "<image", "<use", "<!entity", "javascript:", "@import", "url(http", "href=\"http"];
    if BANNED.iter().any(|needle| text.contains(needle)) {
        return false;
    }
    // An attribute such as ` onload=`.
    let chars: Vec<char> = text.chars().collect();
    !chars.windows(3).enumerate().any(|(i, w)| {
        if !(w[0].is_whitespace() || w[0] == '"' || w[0] == '\'') || w[1] != 'o' || w[2] != 'n' {
            return false;
        }
        let rest: String = chars[i + 3..].iter().take_while(|c| c.is_ascii_alphabetic()).collect();
        let after = chars[i + 3 + rest.chars().count()..].iter().find(|c| !c.is_whitespace());
        !rest.is_empty() && after == Some(&'=')
    })
}

/// The extension for what the bytes really are: a raster picture or a plain SVG.
fn image_extension(bytes: &[u8]) -> Option<&'static str> {
    if bytes.starts_with(&[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a]) {
        Some("png")
    } else if bytes.starts_with(&[0xff, 0xd8, 0xff]) {
        Some("jpg")
    } else if bytes.len() > 12 && &bytes[..4] == b"RIFF" && &bytes[8..12] == b"WEBP" {
        Some("webp")
    } else if plain_svg(bytes) {
        Some("svg")
    } else {
        None
    }
}

async fn download_icon(url: url::Url) -> Option<Vec<u8>> {
    let _permit = ICON_FETCHES.acquire().await.ok()?;
    let _ = rustls::crypto::ring::default_provider().install_default();
    // No redirects: one could lead off the listed hosts.
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .connect_timeout(std::time::Duration::from_secs(5))
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .ok()?;
    let mut response = client.get(url).send().await.ok()?.error_for_status().ok()?;
    if response.content_length().is_some_and(|len| len > MAX_ICON_BYTES as u64) {
        return None;
    }
    let mut bytes = Vec::new();
    while let Some(chunk) = response.chunk().await.ok()? {
        bytes.extend_from_slice(&chunk);
        if bytes.len() > MAX_ICON_BYTES {
            return None;
        }
    }
    Some(bytes)
}

/// A logo from a remote catalog or registry as a `data:` URL, kept in the cache folder so each is downloaded once.
pub async fn remote_icon_data_url(url: &str) -> Option<String> {
    let url = allowed_icon_url(url)?;
    let dir = dirs::cache_dir()?.join("mcp-linker/icons");
    let key: String = ring::digest::digest(&ring::digest::SHA256, url.as_str().as_bytes()).as_ref().iter().map(|b| format!("{b:02x}")).collect();
    for ext in ["png", "jpg", "webp", "svg"] {
        let cached = dir.join(format!("{key}.{ext}"));
        if cached.is_file() {
            return icon_data_url(&cached);
        }
    }
    let bytes = download_icon(url).await?;
    let path = dir.join(format!("{key}.{}", image_extension(&bytes)?));
    std::fs::create_dir_all(&dir).ok()?;
    std::fs::write(&path, &bytes).ok()?;
    icon_data_url(&path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fetches_logos_only_from_listed_https_hosts() {
        assert!(allowed_icon_url("https://files.openai.com/logo.png").is_some());
        assert!(allowed_icon_url("https://chatgpt.com/a/b.png").is_some());
        assert!(allowed_icon_url("https://avatars.githubusercontent.com/u/1?v=4").is_some());
        assert!(allowed_icon_url("https://cdn.jsdelivr.net/gh/milisp/mcp-linker@main/registry/icons/a.svg").is_some());
        assert!(allowed_icon_url("https://cdn.jsdelivr.net/gh/someone/else@main/a.svg").is_none());
        assert!(allowed_icon_url("https://cdn.jsdelivr.net/npm/evil/a.svg").is_none());
        for refused in ["http://files.openai.com/logo.png", "https://example.com/logo.png", "https://files.openai.com.evil.com/logo.png", "https://files.openai.com@evil.com/logo.png", "https://files.openai.com:8443/logo.png", "file:///etc/passwd", "not a url"] {
            assert!(allowed_icon_url(refused).is_none(), "{refused}");
        }
    }

    #[test]
    fn trusts_the_bytes_not_the_name() {
        assert_eq!(image_extension(&[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a, 0]), Some("png"));
        assert_eq!(image_extension(&[0xff, 0xd8, 0xff, 0xe0]), Some("jpg"));
        assert_eq!(image_extension(b"RIFF\0\0\0\0WEBPVP8 "), Some("webp"));
        assert_eq!(image_extension(b"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 8 8\"><path d=\"M0 0h8v8z\"/></svg>"), Some("svg"));
        assert_eq!(image_extension(b"<html>"), None);
    }

    #[test]
    fn shows_the_registry_icons_this_repo_ships() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../registry/icons");
        let mut checked = 0;
        for entry in std::fs::read_dir(dir).unwrap().flatten() {
            let bytes = std::fs::read(entry.path()).unwrap();
            assert!(plain_svg(&bytes), "{} would be refused", entry.path().display());
            checked += 1;
        }
        assert!(checked > 0);
    }

    #[test]
    fn refuses_svg_that_is_more_than_a_drawing() {
        for bad in [
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><script>alert(1)</script></svg>",
            "<svg xmlns=\"http://www.w3.org/2000/svg\" onload=\"alert(1)\"></svg>",
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><foreignObject><div/></foreignObject></svg>",
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><image href=\"https://x.test/a.png\"/></svg>",
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><style>@import url(https://x.test/a.css);</style></svg>",
            "<html><svg></svg></html>",
        ] {
            assert_eq!(image_extension(bad.as_bytes()), None, "{bad}");
        }
    }

    fn write(path: &Path, text: &str) {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(path, text).unwrap();
    }

    #[test]
    fn reads_claude_code_marketplaces_and_installs() {
        let home = tempfile::tempdir().unwrap();
        let h = home.path();
        let mp = h.join(".claude/plugins/marketplaces/mcp-linker");
        write(
            &h.join(".claude/plugins/known_marketplaces.json"),
            &format!(r#"{{ "mcp-linker": {{ "source": {{ "source": "github", "repo": "milisp/mcp-linker" }}, "installLocation": "{}" }} }}"#, mp.display()),
        );
        write(&mp.join(".claude-plugin/marketplace.json"), r#"{ "name": "mcp-linker", "plugins": [
            { "name": "ios", "source": "./plugins/ios", "description": "iOS pack", "category": "development" },
            { "name": "macos", "source": "./plugins/macos", "description": "macOS pack" } ] }"#);
        std::fs::create_dir_all(mp.join("plugins/ios")).unwrap();
        let installed = h.join(".claude/plugins/cache/mcp-linker/ios/0.1.0");
        write(&installed.join("icon.png"), "x");
        write(
            &h.join(".claude/plugins/installed_plugins.json"),
            &format!(r#"{{ "version": 2, "plugins": {{ "ios@mcp-linker": [{{ "scope": "user", "installPath": "{}", "version": "0.1.0" }}] }} }}"#, installed.display()),
        );
        write(&h.join(".claude/settings.json"), r#"{ "enabledPlugins": { "ios@mcp-linker": true } }"#);

        let catalog = catalog_at(PluginClient::ClaudeCode, h);
        assert_eq!(catalog.marketplaces[0].source.as_deref(), Some("milisp/mcp-linker"));
        let ios = catalog.plugins.iter().find(|p| p.name == "ios").unwrap();
        assert!(ios.installed && ios.enabled && !ios.official);
        assert_eq!((ios.description.as_deref(), ios.category.as_deref(), ios.version.as_deref()), (Some("iOS pack"), Some("development"), Some("0.1.0")));
        assert_eq!(ios.icon, Some(installed.join("icon.png")));
        let macos = catalog.plugins.iter().find(|p| p.name == "macos").unwrap();
        assert!(!macos.installed && !macos.enabled);
    }

    #[test]
    fn reads_codex_config_cache_and_interface() {
        let home = tempfile::tempdir().unwrap();
        let h = home.path();
        let root = h.join("runtime");
        write(
            &h.join(".codex/config.toml"),
            &format!("[marketplaces.openai-primary-runtime]\nsource_type = \"local\"\nsource = \"{}\"\n\n[plugins.\"pdf@openai-primary-runtime\"]\nenabled = true\n", root.display()),
        );
        write(&root.join(".agents/plugins/marketplace.json"), r#"{ "name": "openai-primary-runtime", "plugins": [
            { "name": "pdf", "source": { "source": "local", "path": "./plugins/pdf" } },
            { "name": "latex", "source": { "source": "local", "path": "./plugins/latex" } } ] }"#);
        write(&root.join("plugins/latex/.codex-plugin/plugin.json"), r#"{ "name": "latex", "interface": { "displayName": "LaTeX", "shortDescription": "Compile LaTeX" } }"#);
        let cached = h.join(".codex/plugins/cache/openai-primary-runtime/pdf/1.0");
        write(&cached.join(".codex-plugin/plugin.json"), r#"{ "name": "pdf", "interface": { "displayName": "PDF", "shortDescription": "Read PDFs", "logo": "./assets/logo.png" } }"#);
        write(&cached.join("assets/logo.png"), "x");

        let catalog = catalog_at(PluginClient::Codex, h);
        let pdf = catalog.plugins.iter().find(|p| p.name == "pdf").unwrap();
        assert!(pdf.installed && pdf.enabled && pdf.official);
        assert_eq!((pdf.display_name.as_deref(), pdf.description.as_deref()), (Some("PDF"), Some("Read PDFs")));
        assert_eq!(pdf.icon, Some(cached.join("assets/logo.png")));
        let latex = catalog.plugins.iter().find(|p| p.name == "latex").unwrap();
        assert!(!latex.installed);
        assert_eq!(latex.display_name.as_deref(), Some("LaTeX"));
    }
}
