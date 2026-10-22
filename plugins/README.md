# MCP Linker plugin packs

Curated plugins that bundle MCP servers and skills around one theme. Each pack is a single directory that serves both **Claude Code** and **Codex**: shared `.mcp.json` and `skills/`, plus two manifests (`.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`).

| Pack | MCP servers | Skills |
| --- | --- | --- |
| `ios` | [XcodeBuildMCP](https://github.com/getsentry/XcodeBuildMCP) (`xcodebuildmcp`), [ios-simulator-mcp](https://github.com/joshuayoes/ios-simulator-mcp) | `ios-simulator-build-run`, `ios-simulator-ui-automation`, `ios-testflight-release`, `ios-signing-troubleshooting` |
| `macos` | XcodeBuildMCP | `macos-build-test`, `macos-notarize-distribute` |

## Install in Claude Code

```
/plugin marketplace add milisp/mcp-linker
/plugin install ios@mcp-linker
/plugin install macos@mcp-linker
```

Shell equivalent: `claude plugin marketplace add milisp/mcp-linker && claude plugin install ios@mcp-linker`.

## Install in Codex

```
codex plugin marketplace add milisp/mcp-linker
codex plugin add ios@mcp-linker
```

Codex reads `.agents/plugins/marketplace.json` at the repo root. For a local checkout use `codex plugin marketplace add /path/to/mcp-linker`. Run `codex plugin list` to see what is available. The add/list/install flow was tested against a local checkout with an isolated `CODEX_HOME`; the GitHub `owner/repo` form follows `codex plugin marketplace add --help` and works once this is merged to the default branch.

## Requirements

- macOS with Xcode installed (these packs drive `xcodebuild` and the Simulator).
- Node.js 18+ (the MCP servers launch through `npx`).
- Optional CLIs used by the skills:
  - `axe` for simulator UI automation: `brew install cameroncooke/axe/axe`
  - `asc` for App Store Connect, TestFlight and notarization: `brew install asc`. Its API key is configured with `asc auth login` (key ID, issuer ID, `.p8` path); nothing is stored in these plugins.
  - Optional: more `asc` recipes via `npx skills add rorkai/app-store-connect-cli-skills`.

No MCP server in these packs needs secrets, so `.mcp.json` contains no environment variables.

## Layout

```
.claude-plugin/marketplace.json     Claude Code marketplace (repo root)
.agents/plugins/marketplace.json    Codex marketplace (repo root)
plugins/<pack>/.claude-plugin/plugin.json
plugins/<pack>/.codex-plugin/plugin.json
plugins/<pack>/.mcp.json
plugins/<pack>/skills/<skill>/SKILL.md
```

## Submitting your plugin

Built a Claude Code plugin (MCP servers, skills, commands)? Open a pull request that adds **one entry** to `.claude-plugin/marketplace.json`. Your code stays in your own repository; we only point at it.

```json
{
  "name": "my-plugin",
  "source": { "source": "github", "repo": "you/my-plugin", "sha": "<40-character commit>" },
  "description": "What it bundles and what it is for.",
  "homepage": "https://github.com/you/my-plugin",
  "category": "development",
  "keywords": ["mcp"]
}
```

- `name` is lowercase kebab-case and unique; `source.sha` pins a full commit (a branch or tag can change under users). Update the entry in a new pull request to ship a new version.
- The repository root must contain `.claude-plugin/plugin.json`; check it with `claude plugin validate .` there.
- Run `bun run validate-plugins`, then open the pull request. The [listing criteria](../CONTRIBUTING.md#listing-a-plugin) are what reviewers check.
- Codex entries (`.agents/plugins/marketplace.json`) are added by maintainers; a plugin that also ships `.codex-plugin/plugin.json` is welcome to say so in the pull request.

## Adding a pack (maintainers)

Copy an existing pack, edit both manifests and `.mcp.json`, then add an entry to both marketplace files. Validate with `claude plugin validate plugins/<pack>` and `claude plugin validate .`.
