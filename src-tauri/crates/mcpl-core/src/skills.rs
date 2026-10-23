//! Agent skills (`SKILL.md` folders) for Claude Code and Codex, without npm.
//!
//! The layout is the one `npx skills` uses, so both tools see the same state:
//! skills live once in `~/.agents/skills/<name>`, `~/.agents/.skill-lock.json`
//! records where each came from, and a client "has" a skill when
//! `~/.claude/skills/<name>` or `~/.codex/skills/<name>` links to it. Skills
//! that were put straight into a client's folder are listed too and are moved
//! into the shared store the first time they are linked or unlinked.
//!
//! Installing clones the source with the system `git` (shallow), so GitHub
//! `owner/repo`, any Git URL and local folders all work. See docs/skills.md.

use serde::Serialize;
use serde_json::{Map, Value, json};
use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};
use std::process::Command;

use crate::plugins::PluginClient;

/// Where skills live; built from the home directory so tests can use a temp one.
#[derive(Debug, Clone)]
pub struct Paths {
    store: PathBuf,
    lock: PathBuf,
    claude: PathBuf,
    codex: PathBuf,
}

impl Paths {
    pub fn new(home: &Path) -> Self {
        Self {
            store: home.join(".agents/skills"),
            lock: home.join(".agents/.skill-lock.json"),
            claude: home.join(".claude/skills"),
            codex: home.join(".codex/skills"),
        }
    }

    pub fn user() -> Result<Self, String> {
        dirs::home_dir().map(|home| Self::new(&home)).ok_or_else(|| "Could not find the home directory.".to_string())
    }

    fn client_dir(&self, client: PluginClient) -> &Path {
        match client {
            PluginClient::ClaudeCode => &self.claude,
            PluginClient::Codex => &self.codex,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Skill {
    pub name: String,
    pub description: Option<String>,
    /// The folder the skill's files are read from.
    pub path: PathBuf,
    pub claude_code: bool,
    pub codex: bool,
    /// `owner/repo` or the URL it was installed from; none for skills made by hand.
    pub source: Option<String>,
    /// The commit it was installed at.
    pub installed_ref: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillDoc {
    pub name: String,
    pub description: Option<String>,
    /// SKILL.md without its front matter.
    pub markdown: String,
    /// Other files next to it (relative paths).
    pub files: Vec<String>,
    pub path: PathBuf,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Found {
    pub name: String,
    pub description: Option<String>,
    /// Folder inside the source.
    pub path: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Discovered {
    pub source: String,
    pub commit: Option<String>,
    pub skills: Vec<Found>,
}

/// One item of a batch: what happened to `name`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Outcome {
    pub name: String,
    pub error: Option<String>,
    /// Things left alone on purpose (for example a client folder that already has its own copy).
    pub note: Option<String>,
}

impl Outcome {
    pub(crate) fn done(name: &str) -> Self {
        Self { name: name.into(), error: None, note: None }
    }
    pub(crate) fn failed(name: &str, error: impl ToString) -> Self {
        Self { name: name.into(), error: Some(error.to_string()), note: None }
    }
}

// ---- reading ----------------------------------------------------------------

/// `(front matter, body)` of a SKILL.md.
fn split_front_matter(text: &str) -> (Option<serde_yaml::Value>, &str) {
    let text = text.trim_start_matches('\u{feff}');
    let Some(rest) = text.strip_prefix("---") else { return (None, text) };
    let rest = rest.trim_start_matches(['\r', ' ']).strip_prefix('\n').unwrap_or(rest);
    let Some(end) = rest.find("\n---") else { return (None, text) };
    let yaml = &rest[..end];
    let body = rest[end + 4..].trim_start_matches(['\r', '\n']);
    (serde_yaml::from_str(yaml).ok(), body)
}

fn front_str(meta: &Option<serde_yaml::Value>, key: &str) -> Option<String> {
    meta.as_ref()?.get(key)?.as_str().map(|s| s.trim().to_string()).filter(|s| !s.is_empty())
}

fn has_skill(dir: &Path) -> bool {
    dir.join("SKILL.md").is_file()
}

fn is_hidden(name: &str) -> bool {
    name.starts_with('.')
}

fn names_in(dir: &Path) -> Vec<String> {
    let Ok(entries) = std::fs::read_dir(dir) else { return Vec::new() };
    entries
        .flatten()
        .filter_map(|e| e.file_name().into_string().ok())
        .filter(|n| !is_hidden(n) && has_skill(&dir.join(n)))
        .collect()
}

fn read_lock(paths: &Paths) -> Value {
    std::fs::read_to_string(&paths.lock)
        .ok()
        .and_then(|text| serde_json::from_str(&text).ok())
        .unwrap_or_else(|| json!({ "skills": {} }))
}

fn write_lock(paths: &Paths, lock: &Value) -> Result<(), String> {
    if let Some(parent) = paths.lock.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let text = serde_json::to_string_pretty(lock).map_err(|e| e.to_string())?;
    std::fs::write(&paths.lock, text).map_err(|e| e.to_string())
}

fn lock_skills(lock: &mut Value) -> &mut Map<String, Value> {
    if !lock.get("skills").is_some_and(Value::is_object) {
        lock["skills"] = json!({});
    }
    lock["skills"].as_object_mut().expect("just made an object")
}

pub fn list(paths: &Paths) -> Vec<Skill> {
    let names: BTreeSet<String> = [&paths.store, &paths.claude, &paths.codex].iter().flat_map(|dir| names_in(dir)).collect();
    let lock = read_lock(paths);
    names
        .into_iter()
        .map(|name| {
            let path = [&paths.store, &paths.claude, &paths.codex].iter().map(|dir| dir.join(&name)).find(|p| has_skill(p)).expect("listed from one of them");
            let (meta, _) = split_front_matter(&std::fs::read_to_string(path.join("SKILL.md")).unwrap_or_default());
            let entry = lock.pointer(&format!("/skills/{name}"));
            Skill {
                description: front_str(&meta, "description"),
                claude_code: has_skill(&paths.claude.join(&name)),
                codex: has_skill(&paths.codex.join(&name)),
                source: entry.and_then(|e| e.get("source")).and_then(Value::as_str).map(str::to_string),
                installed_ref: entry.and_then(|e| e.get("ref")).and_then(Value::as_str).map(str::to_string),
                name,
                path,
            }
        })
        .collect()
}

fn valid_name(name: &str) -> Result<(), String> {
    if name.is_empty() || name.starts_with('.') || name.contains(['/', '\\']) || name.contains("..") {
        return Err(format!("'{name}' is not a valid skill name."));
    }
    Ok(())
}

pub fn read(paths: &Paths, name: &str) -> Result<SkillDoc, String> {
    valid_name(name)?;
    let path = [&paths.store, &paths.claude, &paths.codex].iter().map(|dir| dir.join(name)).find(|p| has_skill(p)).ok_or_else(|| format!("Skill '{name}' is not installed."))?;
    let text = std::fs::read_to_string(path.join("SKILL.md")).map_err(|e| e.to_string())?;
    let (meta, body) = split_front_matter(&text);
    let mut files = Vec::new();
    collect_files(&path, &path, 0, &mut files);
    files.retain(|f| f != "SKILL.md");
    files.sort();
    files.truncate(200);
    Ok(SkillDoc { name: name.into(), description: front_str(&meta, "description"), markdown: body.to_string(), files, path })
}

fn collect_files(root: &Path, dir: &Path, depth: usize, out: &mut Vec<String>) {
    let Ok(entries) = std::fs::read_dir(dir) else { return };
    for entry in entries.flatten() {
        let path = entry.path();
        let file_name = entry.file_name().to_string_lossy().into_owned();
        if is_hidden(&file_name) {
            continue;
        }
        if path.is_dir() {
            if depth < 3 {
                collect_files(root, &path, depth + 1, out);
            }
        } else if let Ok(rel) = path.strip_prefix(root) {
            out.push(rel.to_string_lossy().replace('\\', "/"));
        }
    }
}

// ---- linking ----------------------------------------------------------------

fn copy_dir(from: &Path, to: &Path) -> std::io::Result<()> {
    std::fs::create_dir_all(to)?;
    for entry in std::fs::read_dir(from)? {
        let entry = entry?;
        if entry.file_name() == ".git" {
            continue;
        }
        let target = to.join(entry.file_name());
        if entry.path().is_dir() {
            copy_dir(&entry.path(), &target)?;
        } else {
            std::fs::copy(entry.path(), &target)?;
        }
    }
    Ok(())
}

fn is_link(path: &Path) -> bool {
    path.symlink_metadata().map(|m| m.file_type().is_symlink()).unwrap_or(false)
}

fn exists_at(path: &Path) -> bool {
    path.symlink_metadata().is_ok()
}

fn remove_entry(path: &Path) -> std::io::Result<()> {
    if is_link(path) || path.is_file() { std::fs::remove_file(path) } else { std::fs::remove_dir_all(path) }
}

fn link(target: &Path, at: &Path) -> std::io::Result<()> {
    if let Some(parent) = at.parent() {
        std::fs::create_dir_all(parent)?;
    }
    #[cfg(unix)]
    return std::os::unix::fs::symlink(target, at);
    #[cfg(windows)]
    return std::os::windows::fs::symlink_dir(target, at).or_else(|_| copy_dir(target, at));
}

/// Makes sure `~/.agents/skills/<name>` exists, moving a skill that lives only in a client's folder there.
fn adopt(paths: &Paths, name: &str) -> Result<PathBuf, String> {
    let home = paths.store.join(name);
    if has_skill(&home) {
        return Ok(home);
    }
    let real = [PluginClient::ClaudeCode, PluginClient::Codex].into_iter().map(|c| paths.client_dir(c).join(name)).find(|p| has_skill(p) && !is_link(p)).ok_or_else(|| format!("Skill '{name}' is not installed."))?;
    std::fs::create_dir_all(&paths.store).map_err(|e| e.to_string())?;
    if std::fs::rename(&real, &home).is_err() {
        copy_dir(&real, &home).map_err(|e| e.to_string())?;
        std::fs::remove_dir_all(&real).map_err(|e| e.to_string())?;
    }
    // The client it came from, and anything that pointed at it, now link to the store.
    for client in PluginClient::ALL {
        let at = paths.client_dir(client).join(name);
        if real == at || (is_link(&at) && !at.exists()) {
            let _ = remove_entry(&at);
            link(&home, &at).map_err(|e| e.to_string())?;
        }
    }
    Ok(home)
}

pub fn set_client(paths: &Paths, name: &str, client: PluginClient, enabled: bool) -> Result<Option<String>, String> {
    valid_name(name)?;
    let at = paths.client_dir(client).join(name);
    if enabled {
        if has_skill(&at) {
            return Ok(None);
        }
        let home = adopt(paths, name)?;
        if exists_at(&at) {
            // Dangling link or a folder without SKILL.md: not ours to guess about.
            if is_link(&at) {
                remove_entry(&at).map_err(|e| e.to_string())?;
            } else {
                return Ok(Some(format!("{} already has a folder named '{name}' without a SKILL.md; left alone.", client.id())));
            }
        }
        link(&home, &at).map_err(|e| e.to_string())?;
    } else if exists_at(&at) {
        adopt(paths, name)?;
        remove_entry(&at).map_err(|e| e.to_string())?;
    }
    Ok(None)
}

pub fn set_clients(paths: &Paths, names: &[String], client: PluginClient, enabled: bool) -> Vec<Outcome> {
    names
        .iter()
        .map(|name| match set_client(paths, name, client, enabled) {
            Ok(note) => Outcome { note, ..Outcome::done(name) },
            Err(e) => Outcome::failed(name, e),
        })
        .collect()
}

pub fn uninstall(paths: &Paths, names: &[String]) -> Vec<Outcome> {
    let mut lock = read_lock(paths);
    let results = names
        .iter()
        .map(|name| {
            if let Err(e) = valid_name(name) {
                return Outcome::failed(name, e);
            }
            let mut error = None;
            for dir in [&paths.claude, &paths.codex, &paths.store] {
                let at = dir.join(name);
                if exists_at(&at)
                    && let Err(e) = remove_entry(&at)
                {
                    error = Some(e.to_string());
                }
            }
            lock_skills(&mut lock).remove(name);
            Outcome { error, ..Outcome::done(name) }
        })
        .collect();
    let _ = write_lock(paths, &lock);
    results
}

// ---- sources ----------------------------------------------------------------

#[derive(Debug, PartialEq, Eq)]
pub struct Source {
    /// What `git clone` takes: a URL or a local path.
    pub url: String,
    /// Shown to the user and stored in the lock file: `owner/repo` for GitHub.
    pub label: String,
    pub subpath: Option<String>,
    pub git_ref: Option<String>,
    pub github: bool,
}

pub fn parse_source(input: &str) -> Result<Source, String> {
    let input = input.trim().trim_end_matches('/');
    if input.is_empty() {
        return Err("Enter a GitHub repo (owner/repo), a Git URL or a folder.".into());
    }
    let github = |owner_repo: &str, tree: Option<&str>| {
        let repo = owner_repo.trim_end_matches(".git");
        let (git_ref, subpath) = match tree.and_then(|t| t.split_once('/')) {
            Some((branch, path)) => (Some(branch.to_string()), Some(path.to_string())),
            None => (tree.map(str::to_string), None),
        };
        Source { url: format!("https://github.com/{repo}.git"), label: repo.to_string(), subpath, git_ref, github: true }
    };
    for prefix in ["https://github.com/", "http://github.com/", "github.com/"] {
        if let Some(rest) = input.strip_prefix(prefix) {
            let mut parts = rest.splitn(3, '/');
            let (Some(owner), Some(repo)) = (parts.next(), parts.next()) else { break };
            let tail = parts.next();
            let tree = tail.and_then(|t| t.strip_prefix("tree/"));
            return Ok(github(&format!("{owner}/{repo}"), tree));
        }
    }
    if input.contains("://") || input.starts_with("git@") {
        return Ok(Source { url: input.to_string(), label: input.trim_end_matches(".git").to_string(), subpath: None, git_ref: None, github: false });
    }
    if Path::new(input).is_dir() {
        return Ok(Source { url: input.to_string(), label: input.to_string(), subpath: None, git_ref: None, github: false });
    }
    // owner/repo[/path/inside]
    let mut parts = input.splitn(3, '/');
    match (parts.next(), parts.next(), parts.next()) {
        (Some(owner), Some(repo), rest) if !owner.is_empty() && !repo.is_empty() && !owner.starts_with(['.', '~']) => {
            let mut source = github(&format!("{owner}/{repo}"), None);
            source.subpath = rest.map(str::to_string);
            Ok(source)
        }
        _ => Err(format!("'{input}' is not a GitHub repo (owner/repo), Git URL or existing folder.")),
    }
}

pub(crate) fn git(dir: Option<&Path>, args: &[&str]) -> Result<String, String> {
    let mut command = Command::new("git");
    command.args(args).env("GIT_TERMINAL_PROMPT", "0");
    if let Some(dir) = dir {
        command.current_dir(dir);
    }
    let output = command.output().map_err(|e| if e.kind() == std::io::ErrorKind::NotFound { "git is not installed or not on PATH.".to_string() } else { e.to_string() })?;
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

fn is_sha(text: &str) -> bool {
    text.len() == 40 && text.bytes().all(|b| b.is_ascii_hexdigit())
}

/// A checkout of a source. Local folders are used in place.
struct Checkout {
    root: PathBuf,
    commit: Option<String>,
    git: bool,
    _tmp: Option<tempfile::TempDir>,
}

fn checkout(source: &Source, git_ref: Option<&str>) -> Result<Checkout, String> {
    if Path::new(&source.url).is_dir() {
        return Ok(Checkout { root: PathBuf::from(&source.url), commit: None, git: false, _tmp: None });
    }
    let tmp = tempfile::tempdir().map_err(|e| e.to_string())?;
    let dir = tmp.path().join("repo");
    let dir_text = dir.to_string_lossy().into_owned();
    let wanted = git_ref.or(source.git_ref.as_deref());
    match wanted {
        Some(sha) if is_sha(sha) => {
            // A pinned commit: GitHub serves any commit by sha.
            std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
            git(Some(&dir), &["init", "-q"])?;
            git(Some(&dir), &["fetch", "-q", "--depth", "1", &source.url, sha])?;
            git(Some(&dir), &["checkout", "-q", "FETCH_HEAD"])?;
        }
        Some(branch) => {
            git(None, &["clone", "-q", "--depth", "1", "--branch", branch, &source.url, &dir_text])?;
        }
        None => {
            git(None, &["clone", "-q", "--depth", "1", &source.url, &dir_text])?;
        }
    }
    let commit = git(Some(&dir), &["rev-parse", "HEAD"]).ok();
    Ok(Checkout { root: dir, commit, git: true, _tmp: Some(tmp) })
}

/// Skill folders in a checkout: the folder itself, or `skills/*`, the hidden per-client
/// folders (`.claude/skills`, …), `plugins/*/skills/*`, and plain subfolders.
fn find_skills(base: &Path) -> Vec<Found> {
    let mut parents: Vec<PathBuf> = vec![base.join("skills"), base.join("skills/.curated"), base.join(".claude/skills"), base.join(".agents/skills"), base.join(".codex/skills"), base.to_path_buf()];
    if let Ok(entries) = std::fs::read_dir(base.join("plugins")) {
        parents.extend(entries.flatten().map(|e| e.path().join("skills")));
    }
    let mut found: BTreeMap<String, Found> = BTreeMap::new();
    let describe = |dir: &Path, fallback: &str| {
        let (meta, _) = split_front_matter(&std::fs::read_to_string(dir.join("SKILL.md")).unwrap_or_default());
        let name = front_str(&meta, "name").filter(|n| valid_name(n).is_ok()).unwrap_or_else(|| fallback.to_string());
        (name, front_str(&meta, "description"))
    };
    if has_skill(base) {
        let fallback = base.file_name().map(|n| n.to_string_lossy().into_owned()).unwrap_or_else(|| "skill".into());
        let (name, description) = describe(base, &fallback);
        return vec![Found { name, description, path: String::new() }];
    }
    for parent in parents {
        let Ok(entries) = std::fs::read_dir(&parent) else { continue };
        for entry in entries.flatten() {
            let dir = entry.path();
            let folder = entry.file_name().to_string_lossy().into_owned();
            if is_hidden(&folder) || !has_skill(&dir) {
                continue;
            }
            let (name, description) = describe(&dir, &folder);
            let rel = dir.strip_prefix(base).map(|p| p.to_string_lossy().replace('\\', "/")).unwrap_or_default();
            found.entry(name.clone()).or_insert(Found { name, description, path: rel });
        }
    }
    found.into_values().collect()
}

fn base_of(checkout: &Checkout, source: &Source) -> Result<PathBuf, String> {
    let base = match &source.subpath {
        Some(sub) if sub.split('/').any(|p| p == "..") => return Err("The path must stay inside the repository.".into()),
        Some(sub) => checkout.root.join(sub),
        None => checkout.root.clone(),
    };
    if base.is_dir() { Ok(base) } else { Err(format!("'{}' was not found in {}.", source.subpath.as_deref().unwrap_or(""), source.label)) }
}

pub fn discover(input: &str, git_ref: Option<&str>) -> Result<Discovered, String> {
    let source = parse_source(input)?;
    let checkout = checkout(&source, git_ref)?;
    let skills = find_skills(&base_of(&checkout, &source)?);
    if skills.is_empty() {
        return Err(format!("No SKILL.md found in {}.", source.label));
    }
    Ok(Discovered { source: source.label, commit: checkout.commit, skills })
}

/// Installs `names` (all when empty) from a source into the shared store and links them for `clients`.
pub fn install(paths: &Paths, input: &str, git_ref: Option<&str>, names: &[String], clients: &[PluginClient]) -> Result<Vec<Outcome>, String> {
    let source = parse_source(input)?;
    let checkout = checkout(&source, git_ref)?;
    let base = base_of(&checkout, &source)?;
    let mut skills = find_skills(&base);
    if !names.is_empty() {
        skills.retain(|s| names.contains(&s.name));
    }
    if skills.is_empty() {
        return Err(format!("No matching skill found in {}.", source.label));
    }
    let mut lock = read_lock(paths);
    let mut outcomes = Vec::new();
    for skill in skills {
        outcomes.push(match install_one(paths, &mut lock, &source, &checkout, &base, &skill, clients) {
            Ok(note) => Outcome { note, ..Outcome::done(&skill.name) },
            Err(e) => Outcome::failed(&skill.name, e),
        });
    }
    write_lock(paths, &lock)?;
    Ok(outcomes)
}

fn install_one(paths: &Paths, lock: &mut Value, source: &Source, checkout: &Checkout, base: &Path, skill: &Found, clients: &[PluginClient]) -> Result<Option<String>, String> {
    valid_name(&skill.name)?;
    let from = if skill.path.is_empty() { base.to_path_buf() } else { base.join(&skill.path) };
    let dest = paths.store.join(&skill.name);
    let managed = lock.pointer(&format!("/skills/{}", skill.name)).is_some();
    if exists_at(&dest) && !managed {
        return Err(format!("'{}' already exists and was not installed by MCP Linker or `npx skills`. Uninstall it first to replace it.", skill.name));
    }
    let staging = paths.store.join(format!(".{}.new", skill.name));
    let _ = std::fs::remove_dir_all(&staging);
    copy_dir(&from, &staging).map_err(|e| e.to_string())?;
    if exists_at(&dest) {
        remove_entry(&dest).map_err(|e| e.to_string())?;
    }
    std::fs::rename(&staging, &dest).map_err(|e| e.to_string())?;

    let now = chrono::Utc::now().to_rfc3339();
    let rel = base.strip_prefix(&checkout.root).map(|p| p.to_string_lossy().replace('\\', "/")).unwrap_or_default();
    let folder = [rel.as_str(), skill.path.as_str()].iter().filter(|p| !p.is_empty()).copied().collect::<Vec<_>>().join("/");
    let folder_hash = if checkout.git && !folder.is_empty() { git(Some(&checkout.root), &["rev-parse", &format!("HEAD:{folder}")]).ok() } else { None };
    let installed_at = lock.pointer(&format!("/skills/{}/installedAt", skill.name)).cloned().unwrap_or_else(|| json!(now));
    lock_skills(lock).insert(
        skill.name.clone(),
        json!({
            "installedAt": installed_at,
            "ref": checkout.commit,
            "skillFolderHash": folder_hash,
            "skillPath": if folder.is_empty() { "SKILL.md".to_string() } else { format!("{folder}/SKILL.md") },
            "source": source.label,
            "sourceType": if source.github { "github" } else if checkout.git { "git" } else { "local" },
            "sourceUrl": source.url,
            "updatedAt": now,
        }),
    );

    let mut notes = Vec::new();
    for &client in clients {
        if let Some(note) = set_client(paths, &skill.name, client, true)? {
            notes.push(note);
        }
    }
    Ok((!notes.is_empty()).then(|| notes.join(" ")))
}

// ---- updates ----------------------------------------------------------------

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Update {
    pub name: String,
    pub latest_ref: Option<String>,
    /// The commit it was installed at.
    pub installed_ref: Option<String>,
    /// When the latest commit was made (ISO 8601), so a minutes-old change stands out.
    pub latest_date: Option<String>,
    /// Files of the skill that differ from the installed commit, capped at `MAX_CHANGED_FILES`; empty when that commit can't be fetched.
    pub changed_files: Vec<String>,
    /// How many files differ in all, when more than are listed.
    pub changed_total: usize,
}

const MAX_CHANGED_FILES: usize = 20;

/// A source that could not be checked.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Failure {
    pub source: String,
    pub error: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateReport {
    pub updates: Vec<Update>,
    /// Sources that could not be reached, so their skills were not checked.
    pub failures: Vec<Failure>,
}

/// Files under `folder` that differ between the installed commit and the checked-out one. Best effort: an old commit the server won't serve gives an empty list.
fn changed_files(checkout: &Checkout, installed: Option<&str>, folder: &str) -> Vec<String> {
    let Some(old) = installed.filter(|r| is_sha(r)) else { return Vec::new() };
    if git(Some(&checkout.root), &["fetch", "-q", "--depth", "1", "origin", old]).is_err() {
        return Vec::new();
    }
    let mut args = vec!["diff", "--name-only", old, "HEAD"];
    if !folder.is_empty() {
        args.extend(["--", folder]);
    }
    git(Some(&checkout.root), &args).map(|out| out.lines().map(str::to_string).collect()).unwrap_or_default()
}

/// Skills installed from Git whose folder changed upstream (compared by git tree hash, so unrelated commits don't count).
pub fn check_updates(paths: &Paths) -> Result<UpdateReport, String> {
    let lock = read_lock(paths);
    let mut by_source: BTreeMap<String, Vec<(String, String, String, Option<String>)>> = BTreeMap::new();
    for (name, entry) in lock.get("skills").and_then(Value::as_object).into_iter().flatten() {
        let text = |key: &str| entry.get(key).and_then(Value::as_str).map(str::to_string);
        let (Some(url), Some(hash), Some(skill_path)) = (text("sourceUrl"), text("skillFolderHash"), text("skillPath")) else { continue };
        if !matches!(text("sourceType").as_deref(), Some("github" | "git")) || Path::new(&url).is_dir() {
            continue;
        }
        let folder = skill_path.trim_end_matches("SKILL.md").trim_end_matches('/').to_string();
        by_source.entry(url).or_default().push((name.clone(), hash, folder, text("ref")));
    }
    let mut updates = Vec::new();
    let mut failures = Vec::new();
    for (url, skills) in by_source {
        let source = Source { url: url.clone(), label: url.clone(), subpath: None, git_ref: None, github: false };
        let checkout = match checkout(&source, None) {
            Ok(checkout) => checkout,
            Err(error) => {
                failures.push(Failure { source: url, error });
                continue;
            }
        };
        let latest_date = git(Some(&checkout.root), &["log", "-1", "--format=%cI"]).ok();
        for (name, hash, folder, installed_ref) in skills {
            let spec = if folder.is_empty() { "HEAD^{tree}".to_string() } else { format!("HEAD:{folder}") };
            if let Ok(latest) = git(Some(&checkout.root), &["rev-parse", &spec])
                && latest != hash
            {
                let mut files = changed_files(&checkout, installed_ref.as_deref(), &folder);
                let changed_total = files.len();
                files.truncate(MAX_CHANGED_FILES);
                updates.push(Update { name, latest_ref: checkout.commit.clone(), installed_ref, latest_date: latest_date.clone(), changed_files: files, changed_total });
            }
        }
    }
    Ok(UpdateReport { updates, failures })
}

/// Re-installs skills from where the lock file says they came from.
pub fn update(paths: &Paths, names: &[String]) -> Vec<Outcome> {
    let lock = read_lock(paths);
    let mut by_source: BTreeMap<String, Vec<String>> = BTreeMap::new();
    let mut outcomes = Vec::new();
    for name in names {
        match lock.pointer(&format!("/skills/{name}/sourceUrl")).and_then(Value::as_str) {
            Some(url) => by_source.entry(url.to_string()).or_default().push(name.clone()),
            None => outcomes.push(Outcome::failed(name, "Not installed from a source; nothing to update from.")),
        }
    }
    for (url, group) in by_source {
        // Skills already linked stay linked: the store is updated in place.
        match install(paths, &url, None, &group, &[]) {
            Ok(done) => outcomes.extend(done),
            Err(e) => outcomes.extend(group.iter().map(|name| Outcome::failed(name, &e))),
        }
    }
    outcomes
}

// ---- Tauri commands ---------------------------------------------------------

async fn blocking<T: Send + 'static>(work: impl FnOnce() -> Result<T, String> + Send + 'static) -> Result<T, String> {
    tokio::task::spawn_blocking(work).await.map_err(|e| e.to_string())?
}

fn clients_of(ids: &[String]) -> Result<Vec<PluginClient>, String> {
    ids.iter().map(|id| PluginClient::parse(id)).collect()
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn skill_list() -> Result<Vec<Skill>, String> {
    blocking(|| Ok(list(&Paths::user()?))).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn skill_read(name: String) -> Result<SkillDoc, String> {
    blocking(move || read(&Paths::user()?, &name)).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn skill_set_client(names: Vec<String>, client: String, enabled: bool) -> Result<Vec<Outcome>, String> {
    let client = PluginClient::parse(&client)?;
    blocking(move || Ok(set_clients(&Paths::user()?, &names, client, enabled))).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn skill_uninstall(names: Vec<String>) -> Result<Vec<Outcome>, String> {
    blocking(move || Ok(uninstall(&Paths::user()?, &names))).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn skill_discover(source: String, git_ref: Option<String>) -> Result<Discovered, String> {
    blocking(move || discover(&source, git_ref.as_deref())).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn skill_install(source: String, git_ref: Option<String>, names: Vec<String>, clients: Vec<String>) -> Result<Vec<Outcome>, String> {
    let clients = clients_of(&clients)?;
    blocking(move || install(&Paths::user()?, &source, git_ref.as_deref(), &names, &clients)).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn skill_check_updates() -> Result<UpdateReport, String> {
    blocking(|| check_updates(&Paths::user()?)).await
}

#[cfg_attr(feature = "tauri", tauri::command)]
pub async fn skill_update(names: Vec<String>) -> Result<Vec<Outcome>, String> {
    blocking(move || Ok(update(&Paths::user()?, &names))).await
}

#[cfg(test)]
mod tests {
    use super::*;

    fn write(path: &Path, text: &str) {
        std::fs::create_dir_all(path.parent().unwrap()).unwrap();
        std::fs::write(path, text).unwrap();
    }

    fn skill_md(name: &str) -> String {
        format!("---\nname: {name}\ndescription: Does {name}\n---\n# {name}\nBody")
    }

    #[test]
    fn splits_front_matter() {
        let (meta, body) = split_front_matter("---\nname: a\ndescription: \"Hi: there\"\n---\n# Title\n");
        assert_eq!(front_str(&meta, "description").as_deref(), Some("Hi: there"));
        assert_eq!(body, "# Title\n");
        let (meta, body) = split_front_matter("# No front matter");
        assert!(meta.is_none());
        assert_eq!(body, "# No front matter");
    }

    #[test]
    fn parses_sources() {
        let s = parse_source("vercel-labs/skills").unwrap();
        assert_eq!((s.url.as_str(), s.label.as_str(), s.subpath), ("https://github.com/vercel-labs/skills.git", "vercel-labs/skills", None));
        let s = parse_source("o/r/skills/pdf").unwrap();
        assert_eq!((s.label.as_str(), s.subpath.as_deref()), ("o/r", Some("skills/pdf")));
        let s = parse_source("https://github.com/o/r/tree/dev/skills/x").unwrap();
        assert_eq!((s.git_ref.as_deref(), s.subpath.as_deref()), (Some("dev"), Some("skills/x")));
        let s = parse_source("git@example.com:o/r.git").unwrap();
        assert!(!s.github);
        assert!(parse_source("nonsense").is_err());
    }

    #[test]
    fn finds_skills_in_common_places() {
        let tmp = tempfile::tempdir().unwrap();
        write(&tmp.path().join("skills/a/SKILL.md"), &skill_md("a"));
        write(&tmp.path().join("plugins/p/skills/b/SKILL.md"), &skill_md("b"));
        write(&tmp.path().join("skills/.hidden/SKILL.md"), &skill_md("h"));
        let found = find_skills(tmp.path());
        assert_eq!(found.iter().map(|f| f.name.as_str()).collect::<Vec<_>>(), ["a", "b"]);
        assert_eq!(found[1].path, "plugins/p/skills/b");

        let single = tempfile::tempdir().unwrap();
        write(&single.path().join("SKILL.md"), &skill_md("solo"));
        assert_eq!(find_skills(single.path())[0].name, "solo");
    }

    #[cfg(unix)]
    #[test]
    fn installs_links_and_uninstalls() {
        let home = tempfile::tempdir().unwrap();
        let paths = Paths::new(home.path());
        let repo = tempfile::tempdir().unwrap();
        write(&repo.path().join("skills/one/SKILL.md"), &skill_md("one"));
        write(&repo.path().join("skills/one/refs/note.md"), "note");
        write(&repo.path().join("skills/two/SKILL.md"), &skill_md("two"));
        let url = repo.path().to_string_lossy().into_owned();

        let done = install(&paths, &url, None, &["one".into()], &[PluginClient::ClaudeCode]).unwrap();
        assert!(done[0].error.is_none());
        let skills = list(&paths);
        assert_eq!(skills.len(), 1);
        assert!(skills[0].claude_code && !skills[0].codex);
        assert!(is_link(&paths.claude.join("one")));
        assert!(paths.store.join("one/refs/note.md").is_file());
        assert_eq!(read_lock(&paths).pointer("/skills/one/sourceType").and_then(Value::as_str), Some("local"));

        // Syncing to the other client is a link too.
        set_client(&paths, "one", PluginClient::Codex, true).unwrap();
        assert!(list(&paths)[0].codex);
        set_client(&paths, "one", PluginClient::ClaudeCode, false).unwrap();
        let skill = &list(&paths)[0];
        assert!(!skill.claude_code && skill.codex);

        let doc = read(&paths, "one").unwrap();
        assert_eq!(doc.files, ["refs/note.md"]);
        assert!(doc.markdown.starts_with("# one"));

        uninstall(&paths, &["one".into()]);
        assert!(list(&paths).is_empty());
        assert!(!exists_at(&paths.codex.join("one")));
        assert!(read_lock(&paths).pointer("/skills/one").is_none());
    }

    #[cfg(unix)]
    #[test]
    fn adopts_a_skill_made_by_hand() {
        let home = tempfile::tempdir().unwrap();
        let paths = Paths::new(home.path());
        write(&paths.claude.join("mine/SKILL.md"), &skill_md("mine"));
        set_client(&paths, "mine", PluginClient::Codex, true).unwrap();
        assert!(paths.store.join("mine/SKILL.md").is_file());
        assert!(is_link(&paths.claude.join("mine")) && is_link(&paths.codex.join("mine")));
        let skill = &list(&paths)[0];
        assert!(skill.claude_code && skill.codex);
        // Turning it off in Claude Code keeps the files in the store.
        set_client(&paths, "mine", PluginClient::ClaudeCode, false).unwrap();
        assert!(paths.store.join("mine/SKILL.md").is_file());
    }

    #[test]
    fn refuses_to_overwrite_unmanaged_skills() {
        let home = tempfile::tempdir().unwrap();
        let paths = Paths::new(home.path());
        write(&paths.store.join("one/SKILL.md"), &skill_md("one"));
        let repo = tempfile::tempdir().unwrap();
        write(&repo.path().join("skills/one/SKILL.md"), &skill_md("one"));
        let done = install(&paths, &repo.path().to_string_lossy(), None, &[], &[]).unwrap();
        assert!(done[0].error.as_deref().unwrap().contains("already exists"));
    }

    #[cfg(unix)]
    #[test]
    fn installs_from_git_pins_a_commit_and_detects_updates() {
        let run = |dir: &Path, args: &[&str]| {
            git(Some(dir), &["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false"].iter().chain(args).copied().collect::<Vec<_>>().as_slice()).unwrap()
        };
        let repo = tempfile::tempdir().unwrap();
        run(repo.path(), &["init", "-q"]);
        write(&repo.path().join("skills/one/SKILL.md"), &skill_md("one"));
        run(repo.path(), &["add", "."]);
        run(repo.path(), &["commit", "-q", "-m", "first"]);
        let first = run(repo.path(), &["rev-parse", "HEAD"]);
        let url = format!("file://{}", repo.path().display());

        let home = tempfile::tempdir().unwrap();
        let paths = Paths::new(home.path());
        let found = discover(&url, None).unwrap();
        assert_eq!(found.skills[0].name, "one");
        install(&paths, &url, None, &[], &[PluginClient::Codex]).unwrap();
        assert_eq!(list(&paths)[0].installed_ref.as_deref(), Some(first.as_str()));
        assert!(check_updates(&paths).unwrap().updates.is_empty());

        write(&repo.path().join("skills/one/SKILL.md"), &format!("{}\nMore", skill_md("one")));
        run(repo.path(), &["commit", "-q", "-am", "second"]);
        let updates = check_updates(&paths).unwrap().updates;
        assert_eq!(updates.iter().map(|u| u.name.as_str()).collect::<Vec<_>>(), ["one"]);
        assert_eq!(updates[0].installed_ref.as_deref(), Some(first.as_str()));
        assert!(updates[0].latest_date.is_some());
        assert_eq!(updates[0].changed_files, ["skills/one/SKILL.md"]);

        // Pinned to the first commit it stays at the old text; updating moves it on and keeps the link.
        install(&paths, &url, Some(&first), &[], &[]).unwrap();
        assert!(read(&paths, "one").unwrap().markdown.contains("one"));
        let outcomes = update(&paths, &["one".into()]);
        assert!(outcomes[0].error.is_none(), "{outcomes:?}");
        assert_ne!(list(&paths)[0].installed_ref.as_deref(), Some(first.as_str()));
        assert!(list(&paths)[0].codex);
        assert!(check_updates(&paths).unwrap().updates.is_empty());

        // A source that has gone is reported, not skipped in silence.
        drop(repo);
        let report = check_updates(&paths).unwrap();
        assert!(report.updates.is_empty());
        assert_eq!(report.failures.len(), 1);
        assert_eq!(report.failures[0].source, url);
    }
}
