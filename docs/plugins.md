# Plugins

Claude Code and Codex both have plugins: a directory with a manifest, MCP
servers (`.mcp.json`) and skills (`skills/<name>/SKILL.md`), installed from a
marketplace. MCP Linker manages them in the app (Plugins page) and in the CLI
(`mcpl plugin`, see `docs/cli.md`). The code is `mcpl_core::plugins`.

| | Claude Code | Codex |
|---|---|---|
| Manifest | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` |
| Marketplace file | `.claude-plugin/marketplace.json` | `.agents/plugins/marketplace.json` |
| Enabled flag | `enabledPlugins` in settings | `[plugins."id"] enabled` in `config.toml` |
| Also supports | commands, agents, hooks, output styles, LSP servers | — |

## How it works

The clients' own CLIs are the source of truth, so their caches, scopes and
defaults keep working:

- List: `claude plugin list --json`, `codex plugin list --json`.
- Install and uninstall: `claude plugin install/uninstall`, `codex plugin add/remove`.
- Marketplaces: `claude/codex plugin marketplace list --json` and `add`.
- Enable and disable: `claude plugin enable/disable --scope <scope>` for Claude
  Code. Codex has no command for it, so MCP Linker sets `enabled` in
  `config.toml` (`codex::set_plugin_enabled`, with `toml_edit` to keep the
  file's formatting).
- Details are read from the plugin directory the CLI reports: the manifest,
  `.mcp.json` (or the manifest's `mcpServers`, inline or as paths), and skill
  frontmatter. `${CLAUDE_PLUGIN_ROOT}` is expanded to that directory.

A missing `claude` or `codex` binary is reported as an error for that client.

## Copying between clients (Pro)

`plugins::copy` (app: "Copy to …", CLI: `mcpl plugin sync`) turns a plugin
installed in one client into one for the other:

1. Stage it in the bridge marketplace for the destination,
   `<app config dir>/plugin-bridge/<client>/plugins/<name>` (one bridge per
   destination, so a plugin copied both ways keeps both copies):
   - skills are copied as they are;
   - MCP servers are converted with `sync::convert_server`, like Local Sync;
   - `assets/`, `scripts/` and `bin/` are copied;
   - parts Codex can't use (commands, agents, hooks, …) are left out and
     reported;
   - the destination's manifest is generated from the source's common fields.
2. Write both marketplace files of the bridge, listing every staged plugin.
3. Register the bridge with the destination as `mcp-linker-bridge` (or
   re-point it if it was registered from elsewhere; refresh it in Claude Code).
4. Install `<name>@mcp-linker-bridge` with the destination's CLI, reinstalling
   it if it was already there.

In the app, the plugins page has a Sync button that opens a two-pane view (Claude Code and Codex);
stage copies in either direction (or "Copy missing") and Save copies them in one
go per direction: `plugins::copy_many` checks the license once, stages every plugin, registers the bridge
marketplace once and installs each, and a plugin that fails does not stop the others.

The license rule is the same as Local Sync involving Claude Code or Codex:
Pro (`license::require_sync`).

## MCP Linker's packs

`plugins/` in this repo holds curated packs (iOS, macOS) that serve both
clients; see `plugins/README.md`. The app offers to add their marketplace
(`milisp/mcp-linker`) when a client doesn't have it yet.

The Plugins page has four tabs: **Public** (the client vendor's own marketplace),
**Curated** (MCP Linker's own packs), **Personal** (every other marketplace you added)
and **Community** (entries other people submitted to the MCP Linker marketplace by pull
request, which point at their own repositories and are not endorsed). The app tells
Curated and Community apart by the entry's `source`: a path inside the marketplace is a
pack (`CatalogEntry::curated`), anything else is Community (`CatalogEntry::community`).
