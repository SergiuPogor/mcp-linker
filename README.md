# MCP Linker

A cross-platform Tauri GUI tool for managing MCP (Model Context Protocol) servers across AI clients like Claude Desktop, VS Code, and Cursor.

![Screenshot](./images/home.png)

## Features

- One-click MCP server installation and configuration
- Support for multiple AI clients (Claude Desktop, Cursor, VS Code, Cline, Roo Code, Windsurf etc.)
- 600+ curated MCP servers available
- Cross-platform: macOS, Windows, Linux
- Auto-detect Python, Node.js, UV environments
- Cloud sync for favorite servers
- Built with Tauri — lightweight (~6MB), fast, secure.

## Key Benefit

**Sync Claude's server configuration across other MCP clients.**  
No more copy-pasting

## Quick Start

1. [Download the latest release](https://github.com/milisp/mcp-linker/releases)
2. Select an MCP server from the list
3. Click "Add" to install and configure automatically
4. Your AI client is ready to use the new server

## Screenshots

| Manage Servers | Server Discovery | Configuration |
|---------------|------------------|---------------|
| ![Manage](./images/manage.png) | ![Discover](./images/home.png) | ![Config](./images/config.png) |

## Development

```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker
bun install
cp .env.example .env
bun tauri dev
```

Requirements: Node.js 20+, Bun, Rust toolchain

## Architecture

- Frontend: Tauri + React + shadcn/ui
- Backend: Optional FastAPI

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## Support

- [Discord Community](https://discord.gg/G9uJxjpd)
- [GitHub Issues](https://github.com/milisp/mcp-linker/issues)

## 🎉 Contributors

Thanks to the following contributors for improving this project:

- [@eltociear](https://github.com/eltociear) — Japanese translation
- [@devilcoder01](https://github.com/devilcoder01) — improved Windows build compatibility and project setup instructions, Github workflow, UI improved, design

---

⭐ Star us on GitHub if you find this useful! [![GitHub stars](https://img.shields.io/github/stars/milisp/mcp-linker?style=social)](https://github.com/milisp/mcp-linker)