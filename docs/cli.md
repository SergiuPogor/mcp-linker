# mcpl CLI

`mcpl` is MCP Linker in the terminal: add, list and sync MCP servers across
Claude Code, Codex, Cursor and the other clients the app supports. It is a
standalone binary with no Tauri or webview dependency.

This file is the command specification. Treat the client ids, target syntax,
command names, flags, JSON output keys and exit codes as a stable interface:
add to them, but do not rename or remove them without a major version bump.

## Layout

```
src-tauri/                  # desktop app and Cargo workspace root
src-tauri/crates/mcpl-core  # client configs, sync conversion, license; no Tauri
src-tauri/crates/mcpl       # the CLI (clap), binary `mcpl`
```

- `mcpl-core` holds every module that reads or writes client configs. With
  feature `tauri` (the app enables it) its functions are also Tauri commands.
- `mcpl_core::sync` converts a server between client formats. It mirrors
  `src/components/manage/localSync.ts`, which the app's Local Sync panel still
  uses; keep the two in step, including their tests.
- `mcpl_core::target` parses targets and dispatches reads and writes to the
  Claude Code, Codex or JSON code paths.

## Targets

Every command addresses a config as `CLIENT[:SCOPE][@PATH]`, passed with
`-c/--client` (repeatable) or `--from`/`--to` for `sync`.

| Example | Meaning |
|---|---|
| `codex` | Codex's user config |
| `claude-code` | Claude Code, local scope, project = current directory |
| `claude-code:project@~/app` | `~/app/.mcp.json` |
| `claude-code:user` | Claude Code user scope |
| `cursor` | `~/.cursor/mcp.json` |
| `cursor:project` | `./.cursor/mcp.json` |
| `cursor@~/app` | `~/app/.cursor/mcp.json` (a path implies project scope) |
| `custom@./mcp.json` | any file |

- Client ids: `claude-desktop`, `claude-code`, `codex`, `cursor`, `cline`,
  `copilot`, `copilot-cli`, `opencode`, `pi`, `hermes`, `augment`, `mcphub`,
  `custom`. Aliases: `cc` (Claude Code), `claude` (Claude Desktop). The app's
  internal ids (`claude_code`, `copilot_cli`, …) are accepted too.
- Scopes: `user`, `project`, `local` (Claude Code only). Without one, each
  client uses its own default: `local` for Claude Code (like `claude mcp add`),
  the user config for everything else.
- Relative paths resolve against the current directory; `~/` expands.

## Commands

```
mcpl ls [-c T]...                      # alias: list
mcpl get <name> [-c T]...
mcpl add <name> -c T... [-e K=V]... [--force] -- <command> [args...]
mcpl add <name> -c T... --url URL [--transport http|sse] [-H 'Name: value']... [--force]
mcpl add-json <name> '<json>' -c T... [--force]
mcpl rm <name> -c T...                 # alias: remove
mcpl enable <name> -c T...
mcpl disable <name> -c T...
mcpl sync --from T --to T... [name...] [--overwrite | --skip-existing]
mcpl clients
mcpl license status | activate <key> | deactivate
```

Global flags: `--json` (machine-readable output), `--dry-run` (change
nothing, print what would change), `-y/--yes` (answer yes to confirmations).

- `ls` and `get` without `-c` cover every client whose config exists on this
  machine, plus the current directory's Claude Code local and project scopes
  when they have servers. Disabled servers are listed separately.
- `add` takes the server in Claude Code's shape and converts it for each
  target, exactly as sync does (e.g. a remote server becomes an `mcp-remote`
  bridge for Claude Desktop, `http_headers` for Codex). Every target is checked
  before any is written: an existing name fails the whole command unless
  `--force`, which replaces the connection settings and keeps the target's
  other keys (`autoApprove`, timeouts, …).
- `sync` copies the source's enabled servers (all, or the named ones) to each
  destination. A destination entry that already reaches the same server is
  `unchanged`. One that differs is replaced with `--overwrite` or `-y`, kept
  with `--skip-existing`, asked about in an interactive terminal, and an error
  otherwise; the error comes before anything is written. Sync never deletes
  servers from a destination (a future `--prune` may).

Reserved for later, so do not use these names for anything else: `search`,
`install <registry-id>` (Official MCP Registry), `plugin …`, `skill …`.

## JSON output

- `ls`: `{ "<target>": { "servers": { name: config }, "disabled": { name: config } } }`
- `get`: `{ "<target>": config }`
- `add`, `add-json`: `{ "dryRun", "changes": [{ "target", "name", "config" }] }`
- `rm`, `enable`, `disable`: `{ "dryRun", "action", "changes": [{ "target", "name" }] }`
- `sync`: `{ "dryRun", "from", "changes": [{ "target", "name", "result", "error"? }] }`,
  `result` being `added`, `updated`, `unchanged`, `skipped` or `failed`
- `clients`: `[{ "id", "label", "installed", "configPath", "projectFile" }]`
- `license`: the app's `LicenseStatus` (`licensed`, `tier`, `displayKey`, `updatesUntil`, `updatesExpired`, …)

Targets in output use the canonical form, e.g. `claude-code:local@/work/app`.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Error (unknown client, server not found, conflict, write failure, …) |
| 2 | Invalid usage (clap) |
| 3 | A license is required |

## Licensing

Same rules as the app (see `docs/license.md`): every command is free except
`sync`, which needs the higher tier of its two clients — free between Claude
Desktop and Cursor, Plus for other clients, Pro once Claude Code or Codex is
involved. `add` to several clients at once is free.

The CLI reads and writes the app's `license.json`
(`<config dir>/dev.milisp.mcplinker/`), so a key activated in either works in
both. The check runs in `mcpl-core` (`license::require_sync`).

## Install

```bash
npx mcpl ls          # run without installing
npm install -g mcpl  # or install
```

Binaries for every platform are also attached to each `mcpl-v*` GitHub release.

## Release

`scripts/bump-mcpl.sh X.Y.Z` sets the crate and npm versions, commits, and tags
`mcpl-vX.Y.Z` (independent of the app's version). Pushing the tag runs the
`mcpl release` workflow:

1. Builds `mcpl` for macOS (arm64, x64; signed and notarized), Linux (x64,
   arm64; static musl) and Windows (x64, arm64).
2. Creates the GitHub release with an archive and sha256 for each target.
3. Publishes npm packages with trusted publishing (OIDC): one per platform
   (`@milisp/mcpl-darwin-arm64`, …, each with its `os`/`cpu`) and `mcpl`, whose
   `bin/mcpl.js` runs the binary from whichever platform package npm installed
   as an optional dependency. Layout: `npm/mcpl`, `npm/platforms/*`.

npm trusted publishing needs each of the seven packages configured once on
npmjs.com (repository `milisp/mcp-linker`, workflow `mcpl-release.yml`). A
package must exist before it can be configured, so the very first publish is
done by hand with `npm publish --access public` from each directory.
