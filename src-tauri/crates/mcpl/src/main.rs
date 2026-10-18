//! `mcpl`: MCP Linker in the terminal. The command surface is specified in
//! docs/cli.md; keep the two in step.

use clap::{Args, Parser, Subcommand, ValueEnum};
use mcpl_core::license;
use mcpl_core::sync::{convert_server, merge_over, same_server};
use mcpl_core::target::{self, Target};
use serde_json::{Map, Value, json};
use std::io::{BufRead, IsTerminal, Write};
use std::path::PathBuf;
use std::process::ExitCode;

/// Manage MCP servers across Claude Code, Codex, Cursor and other AI clients.
///
/// Targets are written CLIENT[:SCOPE][@PATH], e.g. `codex`, `claude-code`,
/// `claude-code:project@~/app`, `cursor:project`, `custom@./mcp.json`.
/// Run `mcpl clients` for every client id.
#[derive(Parser)]
#[command(name = "mcpl", version, about, long_about = None)]
struct Cli {
    /// Print machine-readable JSON.
    #[arg(long, global = true)]
    json: bool,
    /// Show what would change without writing anything.
    #[arg(long, global = true)]
    dry_run: bool,
    /// Answer yes to every confirmation.
    #[arg(short = 'y', long, global = true)]
    yes: bool,
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// List servers; with no -c, every client found on this machine.
    #[command(alias = "list")]
    Ls(Targets),
    /// Show one server's config.
    Get {
        name: String,
        #[command(flatten)]
        targets: Targets,
    },
    /// Add a stdio server (`-- <command> [args...]`) or a remote one (`--url`).
    Add(AddArgs),
    /// Add a server from its JSON config.
    AddJson {
        name: String,
        /// The server entry, e.g. '{"command":"npx","args":["-y","pkg"]}'.
        json: String,
        #[command(flatten)]
        targets: RequiredTargets,
        /// Replace an existing server with the same name.
        #[arg(long)]
        force: bool,
    },
    /// Remove a server.
    #[command(alias = "remove")]
    Rm {
        name: String,
        #[command(flatten)]
        targets: RequiredTargets,
    },
    /// Enable a disabled server.
    Enable {
        name: String,
        #[command(flatten)]
        targets: RequiredTargets,
    },
    /// Disable a server without removing it.
    Disable {
        name: String,
        #[command(flatten)]
        targets: RequiredTargets,
    },
    /// Copy servers from one client to others (needs a license except between
    /// Claude Desktop and Cursor).
    Sync(SyncArgs),
    /// List supported clients, whether they are installed, and their config paths.
    Clients,
    /// Show, activate or deactivate this device's license (shared with the app).
    License {
        #[command(subcommand)]
        action: LicenseAction,
    },
}

#[derive(Args)]
struct Targets {
    /// Target client, CLIENT[:SCOPE][@PATH]; repeat for several.
    #[arg(short = 'c', long = "client", value_name = "TARGET")]
    clients: Vec<String>,
}

#[derive(Args)]
struct RequiredTargets {
    /// Target client, CLIENT[:SCOPE][@PATH]; repeat for several.
    #[arg(short = 'c', long = "client", value_name = "TARGET", required = true)]
    clients: Vec<String>,
}

#[derive(Clone, Copy, ValueEnum)]
enum Transport {
    Http,
    Sse,
}

#[derive(Args)]
struct AddArgs {
    name: String,
    #[command(flatten)]
    targets: RequiredTargets,
    /// Environment variable for a stdio server, KEY=VALUE; repeatable.
    #[arg(short = 'e', long = "env", value_name = "KEY=VALUE")]
    env: Vec<String>,
    /// URL of a remote server.
    #[arg(long, conflicts_with = "command")]
    url: Option<String>,
    /// Transport of a remote server.
    #[arg(long, value_enum, default_value = "http", requires = "url")]
    transport: Transport,
    /// HTTP header for a remote server, 'Name: value'; repeatable.
    #[arg(short = 'H', long = "header", value_name = "NAME: VALUE", requires = "url")]
    headers: Vec<String>,
    /// Replace an existing server with the same name.
    #[arg(long)]
    force: bool,
    /// The command and its arguments, after `--`.
    #[arg(last = true, value_name = "COMMAND")]
    command: Vec<String>,
}

#[derive(Args)]
struct SyncArgs {
    /// Source client, CLIENT[:SCOPE][@PATH].
    #[arg(long, value_name = "TARGET")]
    from: String,
    /// Destination client; repeat for several.
    #[arg(long, value_name = "TARGET", required = true)]
    to: Vec<String>,
    /// Servers to copy; all of the source's enabled servers when omitted.
    names: Vec<String>,
    /// Replace servers that exist on the destination with different settings.
    #[arg(long, conflicts_with = "skip_existing")]
    overwrite: bool,
    /// Leave servers that exist on the destination as they are.
    #[arg(long)]
    skip_existing: bool,
}

#[derive(Subcommand)]
enum LicenseAction {
    Status,
    Activate { key: String },
    Deactivate,
}

/// A failure with its exit code: 1 for errors, 3 when a license is needed.
struct Failure(u8, String);

impl From<String> for Failure {
    fn from(message: String) -> Self {
        Failure(1, message)
    }
}

type Outcome = Result<(), Failure>;

#[tokio::main]
async fn main() -> ExitCode {
    let cli = Cli::parse();
    if let Some(dir) = license::config_dir() {
        license::init(dir);
    }
    match run(&cli).await {
        Ok(()) => ExitCode::SUCCESS,
        Err(Failure(code, message)) => {
            eprintln!("error: {message}");
            ExitCode::from(code)
        }
    }
}

async fn run(cli: &Cli) -> Outcome {
    match &cli.command {
        Command::Ls(targets) => ls(cli, &targets.clients).await,
        Command::Get { name, targets } => get(cli, name, &targets.clients).await,
        Command::Add(args) => {
            let config = server_from_args(args)?;
            put(cli, &args.name, &config, &args.targets.clients, args.force).await
        }
        Command::AddJson { name, json, targets, force } => {
            let config: Value = serde_json::from_str(json).map_err(|e| format!("Invalid JSON: {e}"))?;
            if !config.is_object() {
                return Err("The server config must be a JSON object.".to_string().into());
            }
            put(cli, name, &config, &targets.clients, *force).await
        }
        Command::Rm { name, targets } => each(cli, name, &targets.clients, "removed", Op::Remove).await,
        Command::Enable { name, targets } => each(cli, name, &targets.clients, "enabled", Op::Enable).await,
        Command::Disable { name, targets } => each(cli, name, &targets.clients, "disabled", Op::Disable).await,
        Command::Sync(args) => sync(cli, args).await,
        Command::Clients => clients(cli),
        Command::License { action } => license_command(cli, action).await,
    }
}

fn cwd() -> PathBuf {
    std::env::current_dir().unwrap_or_default()
}

fn parse_targets(specs: &[String]) -> Result<Vec<Target>, Failure> {
    let cwd = cwd();
    specs.iter().map(|spec| Target::parse(spec, &cwd).map_err(Failure::from)).collect()
}

/// The command line or url of a server entry.
fn summary(config: &Value) -> String {
    if let Some(command) = config.get("command").and_then(Value::as_str) {
        let args = config.get("args").and_then(Value::as_array).into_iter().flatten().filter_map(Value::as_str);
        return std::iter::once(command).chain(args).collect::<Vec<_>>().join(" ");
    }
    ["url", "serverUrl", "httpUrl"]
        .iter()
        .find_map(|key| config.get(*key).and_then(Value::as_str))
        .unwrap_or("")
        .to_string()
}

fn print_json(value: &Value) {
    println!("{}", serde_json::to_string_pretty(value).unwrap_or_default());
}

async fn ls(cli: &Cli, specs: &[String]) -> Outcome {
    let targets = if specs.is_empty() { listed_by_default().await } else { parse_targets(specs)? };
    let mut out = Map::new();
    for target in &targets {
        let (servers, disabled) = match (target.servers().await, target.disabled().await) {
            (Ok(servers), Ok(disabled)) => (servers, disabled),
            (Err(e), _) | (_, Err(e)) => {
                if !specs.is_empty() {
                    return Err(format!("{}: {e}", target.describe()).into());
                }
                continue;
            }
        };
        if cli.json {
            out.insert(target.describe(), json!({ "servers": servers, "disabled": disabled }));
            continue;
        }
        if servers.is_empty() && disabled.is_empty() && specs.is_empty() {
            continue;
        }
        println!("{}", target.describe());
        if servers.is_empty() && disabled.is_empty() {
            println!("  (no servers)");
        }
        for (name, config) in &servers {
            println!("  {name}  {}", summary(config));
        }
        for (name, config) in &disabled {
            println!("  {name}  {}  (disabled)", summary(config));
        }
    }
    if cli.json {
        print_json(&Value::Object(out));
    }
    Ok(())
}

/// Every installed client, plus the current directory's Claude Code scopes.
async fn listed_by_default() -> Vec<Target> {
    let mut targets = target::detected();
    let cwd = cwd();
    for spec in ["claude-code:local", "claude-code:project"] {
        if let Ok(target) = Target::parse(spec, &cwd)
            && (target.servers().await.is_ok_and(|s| !s.is_empty()) || target.disabled().await.is_ok_and(|d| !d.is_empty()))
        {
            targets.push(target);
        }
    }
    targets
}

async fn get(cli: &Cli, name: &str, specs: &[String]) -> Outcome {
    let targets = if specs.is_empty() { listed_by_default().await } else { parse_targets(specs)? };
    let mut found = Map::new();
    for target in &targets {
        let Ok(servers) = target.servers().await else { continue };
        let disabled = target.disabled().await.unwrap_or_default();
        if let Some(config) = servers.get(name).or_else(|| disabled.get(name)) {
            found.insert(target.describe(), config.clone());
        }
    }
    if found.is_empty() {
        return Err(format!("Server '{name}' not found.").into());
    }
    if cli.json {
        print_json(&Value::Object(found));
    } else {
        for (target, config) in &found {
            println!("{target}");
            println!("{}", serde_json::to_string_pretty(config).unwrap_or_default());
        }
    }
    Ok(())
}

fn key_value(text: &str, separator: char, what: &str) -> Result<(String, Value), Failure> {
    let (key, value) = text.split_once(separator).ok_or_else(|| format!("Invalid {what} '{text}'"))?;
    let key = key.trim();
    if key.is_empty() {
        return Err(format!("Invalid {what} '{text}'").into());
    }
    Ok((key.to_string(), Value::String(value.trim_start().to_string())))
}

/// The server described by `mcpl add`'s flags, in Claude Code's format;
/// each target gets it converted to its own.
fn server_from_args(args: &AddArgs) -> Result<Value, Failure> {
    if let Some(url) = &args.url {
        let headers: Map<String, Value> = args.headers.iter().map(|h| key_value(h, ':', "header")).collect::<Result<_, _>>()?;
        let kind = match args.transport {
            Transport::Http => "http",
            Transport::Sse => "sse",
        };
        let mut config = json!({ "type": kind, "url": url });
        if !headers.is_empty() {
            config["headers"] = Value::Object(headers);
        }
        return Ok(config);
    }
    let (command, rest) = args
        .command
        .split_first()
        .ok_or_else(|| "Give a command after `--` (e.g. `mcpl add fs -c codex -- npx -y pkg`) or a --url.".to_string())?;
    let env: Map<String, Value> = args.env.iter().map(|e| key_value(e, '=', "env")).collect::<Result<_, _>>()?;
    let mut config = json!({ "command": command, "args": rest });
    if !env.is_empty() {
        config["env"] = Value::Object(env);
    }
    Ok(config)
}

async fn existing(target: &Target, name: &str) -> Result<Option<Value>, String> {
    if let Some(config) = target.servers().await?.remove(name) {
        return Ok(Some(config));
    }
    Ok(target.disabled().await?.remove(name))
}

async fn put(cli: &Cli, name: &str, config: &Value, specs: &[String], force: bool) -> Outcome {
    let targets = parse_targets(specs)?;
    // Check every target before writing to any, so a conflict changes nothing.
    let mut plan = Vec::new();
    for target in &targets {
        let converted = convert_server(target.client_id(), config).map_err(|e| format!("{}: {e}", target.describe()))?;
        let current = existing(target, name).await.map_err(|e| format!("{}: {e}", target.describe()))?;
        if current.is_some() && !force {
            return Err(format!("{}: '{name}' already exists; pass --force to replace it.", target.describe()).into());
        }
        plan.push((target, merge_over(current.as_ref(), converted)));
    }
    let mut report = Vec::new();
    for (target, entry) in plan {
        if !cli.dry_run {
            target.put(name, entry.clone()).await.map_err(|e| format!("{}: {e}", target.describe()))?;
        }
        report.push(json!({ "target": target.describe(), "name": name, "config": entry }));
        if !cli.json {
            let verb = if cli.dry_run { "would add" } else { "added" };
            println!("{verb} {name} to {}", target.describe());
        }
    }
    if cli.json {
        print_json(&json!({ "dryRun": cli.dry_run, "changes": report }));
    }
    Ok(())
}

#[derive(Clone, Copy)]
enum Op {
    Remove,
    Enable,
    Disable,
}

async fn each(cli: &Cli, name: &str, specs: &[String], done: &str, op: Op) -> Outcome {
    let targets = parse_targets(specs)?;
    let mut report = Vec::new();
    for target in &targets {
        let label = target.describe();
        if existing(target, name).await.map_err(|e| format!("{label}: {e}"))?.is_none() {
            return Err(format!("{label}: server '{name}' not found.").into());
        }
        if !cli.dry_run {
            let result = match op {
                Op::Remove => target.remove(name).await,
                Op::Enable => target.set_enabled(name, true).await,
                Op::Disable => target.set_enabled(name, false).await,
            };
            result.map_err(|e| format!("{label}: {e}"))?;
        }
        if cli.json {
            report.push(json!({ "target": label, "name": name }));
        } else {
            println!("{}{done} {name} in {label}", if cli.dry_run { "would be " } else { "" });
        }
    }
    if cli.json {
        print_json(&json!({ "dryRun": cli.dry_run, "action": done, "changes": report }));
    }
    Ok(())
}

fn confirm(question: &str) -> bool {
    eprint!("{question} [y/N] ");
    let _ = std::io::stderr().flush();
    let mut answer = String::new();
    std::io::stdin().lock().read_line(&mut answer).is_ok() && matches!(answer.trim(), "y" | "Y" | "yes")
}

async fn sync(cli: &Cli, args: &SyncArgs) -> Outcome {
    let cwd = cwd();
    let from = Target::parse(&args.from, &cwd)?;
    let destinations = parse_targets(&args.to)?;
    for to in &destinations {
        if to == &from {
            return Err(format!("{} is both the source and a destination.", to.describe()).into());
        }
        license::require_sync(from.client_id(), to.client_id()).map_err(|e| {
            Failure(3, format!("{e} Buy one at https://mcp-linker.milisp.dev/pricing, then run `mcpl license activate <key>`."))
        })?;
    }
    let source = from.servers().await.map_err(|e| format!("{}: {e}", from.describe()))?;
    let names: Vec<String> = if args.names.is_empty() { source.keys().cloned().collect() } else { args.names.clone() };
    if let Some(missing) = names.iter().find(|n| !source.contains_key(*n)) {
        return Err(format!("{}: server '{missing}' not found.", from.describe()).into());
    }

    // Plan every destination first; nothing is written until conflicts are settled.
    let interactive = std::io::stdin().is_terminal() && !cli.yes && !cli.json;
    let mut plan = Vec::new();
    let mut report = Vec::new();
    for to in &destinations {
        let label = to.describe();
        let mut current = to.servers().await.map_err(|e| format!("{label}: {e}"))?;
        current.extend(to.disabled().await.map_err(|e| format!("{label}: {e}"))?);
        for name in &names {
            let converted = match convert_server(to.client_id(), &source[name]) {
                Ok(converted) => converted,
                Err(e) => {
                    report.push(json!({ "target": label, "name": name, "result": "failed", "error": e }));
                    continue;
                }
            };
            let result = match current.get(name) {
                None => "added",
                Some(old) if same_server(old, &converted) => "unchanged",
                Some(_) if args.overwrite => "updated",
                Some(_) if args.skip_existing => "skipped",
                Some(_) if cli.yes => "updated",
                Some(_) if interactive => {
                    if confirm(&format!("{label} already has a different '{name}'. Replace it?")) { "updated" } else { "skipped" }
                }
                Some(_) => {
                    return Err(format!(
                        "{label} already has a different '{name}'. Pass --overwrite or --skip-existing."
                    )
                    .into());
                }
            };
            if matches!(result, "added" | "updated") {
                plan.push((to, name.clone(), merge_over(current.get(name), converted)));
            }
            report.push(json!({ "target": label, "name": name, "result": result }));
        }
    }

    if !cli.dry_run {
        for (to, name, entry) in plan {
            if let Err(e) = to.put(&name, entry).await {
                let label = to.describe();
                if let Some(row) = report.iter_mut().find(|r| r["target"] == label && r["name"] == name) {
                    row["result"] = json!("failed");
                    row["error"] = json!(e);
                }
            }
        }
    }

    let failed = report.iter().any(|r| r["result"] == "failed");
    if cli.json {
        print_json(&json!({ "dryRun": cli.dry_run, "from": from.describe(), "changes": report }));
    } else {
        for row in &report {
            let result = row["result"].as_str().unwrap_or("");
            let shown = if cli.dry_run && matches!(result, "added" | "updated") { format!("would be {result}") } else { result.to_string() };
            let error = row.get("error").and_then(Value::as_str).map(|e| format!(": {e}")).unwrap_or_default();
            println!("{}  {}  {shown}{error}", row["target"].as_str().unwrap_or(""), row["name"].as_str().unwrap_or(""));
        }
    }
    if failed { Err("Some servers could not be synced.".to_string().into()) } else { Ok(()) }
}

fn clients(cli: &Cli) -> Outcome {
    let cwd = cwd();
    let mut rows = Vec::new();
    for (public, info) in target::public_clients() {
        let user = Target::parse(if public == "claude-code" { "claude-code:user" } else { public }, &cwd).ok();
        let path = user.as_ref().and_then(|t| t.config_path().ok());
        let installed = path.as_ref().is_some_and(|p| p.exists());
        rows.push(json!({
            "id": public,
            "label": info.label,
            "installed": installed,
            "configPath": path.map(|p| p.display().to_string()),
            "projectFile": info.project_file,
        }));
    }
    if cli.json {
        print_json(&Value::Array(rows));
        return Ok(());
    }
    for row in &rows {
        let mark = if row["installed"] == true { "*" } else { " " };
        let path = row["configPath"].as_str().unwrap_or("(pick a file: custom@PATH)");
        println!("{mark} {:<15} {:<28} {path}", row["id"].as_str().unwrap_or(""), row["label"].as_str().unwrap_or(""));
    }
    println!("\n* config found on this machine");
    Ok(())
}

async fn license_command(cli: &Cli, action: &LicenseAction) -> Outcome {
    let status = match action {
        LicenseAction::Status => license::license_status(),
        LicenseAction::Activate { key } => license::activate_license(key.clone()).await?,
        LicenseAction::Deactivate => license::deactivate_license().await?,
    };
    let value = serde_json::to_value(&status).unwrap_or_default();
    if cli.json {
        print_json(&value);
        return Ok(());
    }
    let tier = value["tier"].as_str().unwrap_or("free");
    println!("tier: {tier}");
    if let Some(key) = value["displayKey"].as_str() {
        println!("key: {key}");
    }
    if let Some(until) = value["updatesUntil"].as_str() {
        println!("updates until: {until}");
    }
    if value["updatesExpired"] == true {
        println!("This build was released after the key's year of updates; it runs as the free tier.");
    }
    Ok(())
}
