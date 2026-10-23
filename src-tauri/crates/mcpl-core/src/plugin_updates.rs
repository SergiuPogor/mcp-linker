//! Which installed plugins have a newer version, and updating them through the client's own CLI.

use crate::plugin_catalog::{CatalogEntry, catalog_at, codex_remote, manifest_of, market_rows, source_dir, text};
use crate::plugins::{PluginClient, find, run};
use crate::skills::{Outcome, git};
use serde::Serialize;
use std::path::Path;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginUpdate {
    /// `name@marketplace`.
    pub id: String,
    pub name: String,
    pub marketplace: String,
    pub installed: Option<String>,
    /// A version number, or the first 12 characters of a commit for plugins that have none.
    pub latest: String,
    /// When the latest commit was made (ISO 8601), when the marketplace is a git checkout.
    pub latest_date: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCheck {
    pub updates: Vec<PluginUpdate>,
    /// Why the marketplaces could not be refreshed first; the comparison then used what is on disk.
    pub refresh_error: Option<String>,
}

fn parts(version: &str) -> Option<Vec<u64>> {
    version.trim_start_matches('v').split('.').map(|part| part.parse().ok()).collect()
}

/// Whether `latest` is a higher dotted number than `installed`. None when either is not one (a commit, `latest`): nothing is guessed.
fn newer(installed: &str, latest: &str) -> Option<bool> {
    let (mut a, mut b) = (parts(installed)?, parts(latest)?);
    let len = a.len().max(b.len());
    a.resize(len, 0);
    b.resize(len, 0);
    Some(b > a)
}

/// A commit id (or its start), which is what Claude Code records for a plugin that declares no version.
fn is_commit(version: &str) -> bool {
    (7..=40).contains(&version.len()) && version.bytes().all(|b| b.is_ascii_hexdigit()) && version.bytes().any(|b| b.is_ascii_alphabetic())
}

fn date_of(root: &Path, folder: &str) -> Option<String> {
    let mut args = vec!["log", "-1", "--format=%cI"];
    if !folder.is_empty() {
        args.extend(["--", folder]);
    }
    git(Some(root), &args).ok().filter(|d| !d.is_empty())
}

/// What a Claude Code marketplace offers for `entry` now, with the date of that change.
fn claude_update(root: &Path, entry: &CatalogEntry) -> Option<(String, Option<String>)> {
    let row = market_rows(PluginClient::ClaudeCode, root).into_iter().find(|r| text(r.get("name")).as_deref() == Some(entry.name.as_str()))?;
    let folder_dir = source_dir(root, row.get("source"));
    let folder = folder_dir.as_deref().and_then(|dir| dir.strip_prefix(root).ok()).map(|rel| rel.to_string_lossy().into_owned());
    let installed = entry.version.as_deref()?;
    let declared = text(row.get("version")).or_else(|| folder_dir.as_deref().and_then(manifest_of).and_then(|m| text(m.get("version"))));
    if let Some(declared) = declared {
        return newer(installed, &declared)?.then(|| {
            let date = if root.join(".git").exists() { date_of(root, folder.as_deref().unwrap_or("")) } else { None };
            (declared, date)
        });
    }
    // No declared version: the installed one is the marketplace's commit. Only changes inside the plugin's own folder count.
    let folder = folder?;
    if !is_commit(installed) || !root.join(".git").exists() {
        return None;
    }
    let head = git(Some(root), &["rev-parse", "HEAD"]).ok()?;
    if head.starts_with(installed) {
        return None;
    }
    let mut args = vec!["diff", "--name-only", installed, "HEAD"];
    if !folder.is_empty() {
        args.extend(["--", folder.as_str()]);
    }
    // A commit the checkout no longer has is counted as a change.
    let changed = git(Some(root), &args).map(|out| !out.trim().is_empty()).unwrap_or(true);
    changed.then(|| (head[..12.min(head.len())].to_string(), date_of(root, &folder)))
}

/// What Codex's catalogs offer for `entry` now: its remote catalog, else its marketplace.
fn codex_update(root: Option<&Path>, remote: &[CatalogEntry], entry: &CatalogEntry) -> Option<(String, Option<String>)> {
    let installed = entry.version.as_deref()?;
    let offered = remote.iter().find(|r| r.id == entry.id).and_then(|r| r.version.clone()).or_else(|| {
        let row = market_rows(PluginClient::Codex, root?).into_iter().find(|r| text(r.get("name")).as_deref() == Some(entry.name.as_str()))?;
        text(row.get("version"))
    })?;
    newer(installed, &offered)?.then_some((offered, None))
}

/// Installed plugins whose marketplace now offers a newer version, judged from what is on disk.
pub fn check_at(client: PluginClient, home: &Path) -> Vec<PluginUpdate> {
    let catalog = catalog_at(client, home);
    let remote = if client == PluginClient::Codex { codex_remote(home) } else { Vec::new() };
    catalog
        .plugins
        .iter()
        .filter(|entry| entry.installed)
        .filter_map(|entry| {
            let root = catalog.marketplaces.iter().find(|m| m.name == entry.marketplace).and_then(|m| m.location.as_deref());
            let (latest, latest_date) = match client {
                PluginClient::ClaudeCode => claude_update(root?, entry)?,
                PluginClient::Codex => codex_update(root, &remote, entry)?,
            };
            Some(PluginUpdate { id: entry.id.clone(), name: entry.name.clone(), marketplace: entry.marketplace.clone(), installed: entry.version.clone(), latest, latest_date })
        })
        .collect()
}

/// Looks for updates; with `refresh` the client first fetches its marketplaces, so the comparison is against what they offer today.
pub async fn check(client: PluginClient, refresh: bool) -> Result<UpdateCheck, String> {
    let refresh_error = if refresh {
        let args: &[&str] = match client {
            PluginClient::ClaudeCode => &["plugin", "marketplace", "update"],
            PluginClient::Codex => &["plugin", "marketplace", "upgrade"],
        };
        run(client, args).await.err()
    } else {
        None
    };
    let home = dirs::home_dir().ok_or("Unable to find the home directory.")?;
    let updates = tokio::task::spawn_blocking(move || check_at(client, &home)).await.map_err(|e| e.to_string())?;
    Ok(UpdateCheck { updates, refresh_error })
}

async fn update_one(client: PluginClient, id: &str) -> Result<Option<String>, String> {
    let plugin = find(client, id).await?;
    match client {
        PluginClient::ClaudeCode => {
            // No `-y`: a marketplace command that needs a person's approval stays refused here.
            let output = run(client, &["plugin", "update", &plugin.id]).await.map_err(|e| {
                if e.contains("--accept-command") { format!("{e}\nReview and accept it in Claude Code: claude plugin update {}", plugin.id) } else { e }
            })?;
            Ok(output.lines().rev().map(|l| l.trim().trim_start_matches('\u{2714}').trim()).find(|l| !l.is_empty()).map(str::to_string))
        }
        PluginClient::Codex => {
            // Codex has no update command; adding an installed plugin again replaces it, but also switches it on.
            run(client, &["plugin", "add", &plugin.id]).await?;
            if !plugin.enabled {
                crate::codex::set_plugin_enabled(&plugin.id, false).await?;
            }
            Ok(Some("Restart Codex to apply.".into()))
        }
    }
}

/// Updates plugins one by one, so one that fails does not stop the rest.
pub async fn update(client: PluginClient, ids: &[String]) -> Vec<Outcome> {
    let mut outcomes = Vec::new();
    for id in ids {
        outcomes.push(match update_one(client, id).await {
            Ok(note) => Outcome { note, ..Outcome::done(id) },
            Err(error) => Outcome::failed(id, error),
        });
    }
    outcomes
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_check_updates(client: String, refresh: bool) -> Result<UpdateCheck, String> {
    check(PluginClient::parse(&client)?, refresh).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn plugin_update(client: String, ids: Vec<String>) -> Result<Vec<Outcome>, String> {
    Ok(update(PluginClient::parse(&client)?, &ids).await)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn write(path: &Path, text: &str) {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(path, text).unwrap();
    }

    fn run_git(dir: &Path, args: &[&str]) -> String {
        git(Some(dir), &["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false"].iter().chain(args).copied().collect::<Vec<_>>().as_slice()).unwrap()
    }

    /// A Claude Code home with `plugin` installed from `market`, whose checkout is `root`.
    fn claude_home(root: &Path, installed_version: &str) -> tempfile::TempDir {
        let home = tempfile::tempdir().unwrap();
        let h = home.path();
        write(&h.join(".claude/plugins/known_marketplaces.json"), &format!(r#"{{ "market": {{ "source": {{ "source": "github", "repo": "o/r" }}, "installLocation": "{}" }} }}"#, root.display()));
        write(&h.join(".claude/plugins/installed_plugins.json"), &format!(r#"{{ "plugins": {{ "plugin@market": [{{ "scope": "user", "installPath": "{}", "version": "{installed_version}" }}] }} }}"#, h.join("cache").display()));
        home
    }

    #[test]
    fn compares_dotted_versions_only() {
        assert_eq!(newer("1.0.0", "1.1.0"), Some(true));
        assert_eq!(newer("1.1.0", "1.1"), Some(false));
        assert_eq!(newer("1.2.0", "1.1.9"), Some(false));
        assert_eq!(newer("26.1013.40934", "26.1020.11127"), Some(true));
        assert_eq!(newer("latest", "1.0.0"), None);
        assert_eq!(newer("dbd4588f9e10", "1.0.0"), None);
        assert!(is_commit("dbd4588f9e10"));
        assert!(!is_commit("1.0.0") && !is_commit("20261022"));
    }

    #[test]
    fn claude_plugin_with_a_declared_version() {
        let market = tempfile::tempdir().unwrap();
        write(&market.path().join(".claude-plugin/marketplace.json"), r#"{ "name": "market", "plugins": [{ "name": "plugin", "source": "./plugin", "version": "1.1.0" }] }"#);
        let behind = claude_home(market.path(), "1.0.0");
        let updates = check_at(PluginClient::ClaudeCode, behind.path());
        assert_eq!((updates[0].id.as_str(), updates[0].installed.as_deref(), updates[0].latest.as_str()), ("plugin@market", Some("1.0.0"), "1.1.0"));
        assert!(check_at(PluginClient::ClaudeCode, claude_home(market.path(), "1.1.0").path()).is_empty());
        assert!(check_at(PluginClient::ClaudeCode, claude_home(market.path(), "2.0.0").path()).is_empty());
    }

    #[cfg(unix)]
    #[test]
    fn claude_plugin_without_a_version_follows_its_own_folder() {
        let market = tempfile::tempdir().unwrap();
        let root: PathBuf = market.path().into();
        run_git(&root, &["init", "-q"]);
        write(&root.join(".claude-plugin/marketplace.json"), r#"{ "name": "market", "plugins": [{ "name": "plugin", "source": "./plugins/plugin" }] }"#);
        write(&root.join("plugins/plugin/SKILL.md"), "one");
        write(&root.join("other/file.md"), "one");
        run_git(&root, &["add", "."]);
        run_git(&root, &["commit", "-q", "-m", "one"]);
        let installed = run_git(&root, &["rev-parse", "HEAD"])[..12].to_string();
        let home = claude_home(&root, &installed);
        assert!(check_at(PluginClient::ClaudeCode, home.path()).is_empty());

        // A commit elsewhere in the marketplace is not an update for this plugin.
        write(&root.join("other/file.md"), "two");
        run_git(&root, &["commit", "-q", "-am", "elsewhere"]);
        assert!(check_at(PluginClient::ClaudeCode, home.path()).is_empty());

        write(&root.join("plugins/plugin/SKILL.md"), "two");
        run_git(&root, &["commit", "-q", "-am", "plugin"]);
        let head = run_git(&root, &["rev-parse", "HEAD"]);
        let updates = check_at(PluginClient::ClaudeCode, home.path());
        assert_eq!(updates.len(), 1);
        assert_eq!(updates[0].latest, head[..12]);
        assert!(updates[0].latest_date.is_some());
    }

    /// Reads this machine's own plugins; run with `cargo test -p mcpl-core real_home -- --ignored --nocapture`.
    #[test]
    #[ignore]
    fn real_home() {
        let home = dirs::home_dir().unwrap();
        for client in [PluginClient::ClaudeCode, PluginClient::Codex] {
            let installed = catalog_at(client, &home).plugins.iter().filter(|p| p.installed).count();
            println!("{}: {installed} installed, updates: {:#?}", client.id(), check_at(client, &home));
        }
    }

    #[test]
    fn codex_plugin_against_its_marketplace() {
        let home = tempfile::tempdir().unwrap();
        let h = home.path();
        let market = h.join("market");
        write(&market.join(".agents/plugins/marketplace.json"), r#"{ "name": "market", "plugins": [{ "name": "plugin", "source": "./plugin", "version": "1.2.0" }, { "name": "pinned", "source": "./pinned", "version": "9.0.0" }] }"#);
        write(&h.join(".codex/config.toml"), &format!("[marketplaces.market]\nsource_type = \"local\"\nsource = \"{}\"\n", market.display()));
        write(&h.join(".codex/plugins/cache/market/plugin/1.0.0/.codex-plugin/plugin.json"), "{}");
        // A directory that is not a version says nothing about being behind.
        write(&h.join(".codex/plugins/cache/market/pinned/latest/.codex-plugin/plugin.json"), "{}");
        let updates = check_at(PluginClient::Codex, h);
        assert_eq!(updates.iter().map(|u| (u.id.as_str(), u.latest.as_str())).collect::<Vec<_>>(), [("plugin@market", "1.2.0")]);
    }
}
