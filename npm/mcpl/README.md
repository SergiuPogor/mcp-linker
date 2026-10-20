# mcpl

Manage MCP servers across Claude Code, Codex, Cursor, Claude Desktop, Copilot,
Cline, OpenCode and more, from the terminal. The CLI of
[MCP Linker](https://github.com/milisp/mcp-linker).

```bash
npx @milisp/mcpl ls                       # every client on this machine
npm install -g @milisp/mcpl               # or install it

# Add one server to Claude Code, Codex and Cursor at once
mcpl add fs -c claude-code -c codex -c cursor -- npx -y @modelcontextprotocol/server-filesystem ~/work
mcpl add docs -c codex --url https://mcp.example.com/mcp -H 'Authorization: Bearer …'

mcpl sync --from claude-code --to codex   # copy servers between clients (license)
```

Every command, the `CLIENT[:SCOPE][@PATH]` target syntax, JSON output and exit
codes: [docs/cli.md](https://github.com/milisp/mcp-linker/blob/main/docs/cli.md).

Licensed under AGPL-3.0-only.
