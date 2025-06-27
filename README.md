# MCP Linker

MCP manage, one-click install and sync MCP (Model Context Protocol) servers across AI clients like Claude Code and Desktop, Cursor, and Cline — all via a lightweight Tauri GUI with a built-in MCP server marketplace.

> A new way to install MCP server for CLaude Desktop

> [Desktop Extensions](https://www.anthropic.com/engineering/desktop-extensions) One-click MCP server installation for Claude Desktop

[awesome-claude-dxt](https://github.com/milisp/awesome-claude-dxt) - A curated list of awesome Claude Desktop Extensions (.dxt files), tools, and resources - by milisp

<div align="center">

![MCP Linker Logo](./public/logo.png)

[中文](./docs/README.zh-CN.md) | [Deutsch](./docs/README.de.md) | [es](./docs/README.es.md) | [fr](./docs/README.fr.md) | [日本語](./docs/README.ja-JP.md) | [繁體中文](./docs/README.zh-Han.md)

⚡️ **Say goodbye to copy-paste**

[![GitHub stars](https://img.shields.io/github/stars/milisp/mcp-linker?style=for-the-badge&logo=github&color=yellow)](https://github.com/milisp/mcp-linker/stargazers)
[![GitHub release](https://img.shields.io/github/release/milisp/mcp-linker.svg?style=for-the-badge&logo=github)](https://github.com/milisp/mcp-linker/releases)

### 🌟 **Love this project? Give us a star!** 🌟

---

### 🚀 Get Started in 30 Seconds

[📥 **Download Now**](https://github.com/milisp/mcp-linker/releases) • [🚀 Quick Start](#quick-start) • [💬 Join Discord](https://discord.gg/UqXeVqUKQq)

</div>

---

## ✨ Why Choose MCP Linker?

**The fastest way to supercharge your AI workflow**

![Demo](./images/demo.gif)

### 🎯 Key Features

- **🚀 One-Click Installation** — No more manual config file editing
- **🔄 Multi-Client Support** — Claude Code and Desktop, Cursor, VS Code, Cline, Roo Code, Windsurf, and more
- **📦 600+ Curated Servers** — The build-in MCP server marketplace
- **🌐 Cross-Platform** — macOS, Windows, Linux (lightweight ~6MB)
- **🔍 Smart Detection** — Auto-detect Python, Node.js, UV environments
- **⚡ Built with Tauri** — Fast, secure, and resource-efficient

### 💎 Game-Changing Benefits

- Sync MCP server configuration across all your MCP clients.
- Pro users get 🔐 Encrypted Cloud Sync.
- Team collaboration features!

## 🚀 Quick Start

**Get up and running in under a minute:**

1. **[📥 Download the latest release](https://github.com/milisp/mcp-linker/releases)**
2. **🔍 Browse** our curated MCP server marketplace
3. **➕ Click "Add"** to install and configure automatically
4. **🎉 Done!**

> **💡 Pro Tip:** Star this repo to stay updated with new MCP servers and features!

## 🚀 Upgrade to MCP-Linker Pro or Team

👉 [Check out pricing plans](./early-access.md) or [sign up for early access](https://mcp-linker.store/early-access).

## 📸 Screenshots

| Manage                         | 🔍 Server Discovery            | ⚙️ Configuration               |
| ------------------------------ | ------------------------------ | ------------------------------ |
| ![Manage](./images/manage.png) | ![Discover](./images/home.png) | ![Config](./images/config.png) |

---

## 🛠️ Development

```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker
bun install
cp .env.example .env
bun tauri dev
```

**Requirements:** Node.js 20+, Bun, Rust toolchain

---

## 🏗️ Architecture

- **Frontend:** Tauri + React + shadcn/ui
- **Backend:** Optional FastAPI

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

**Found this helpful? Consider giving us a ⭐ to support the project!**

---

## 💬 Support & Community

- **[💬 Join our Discord Community](https://discord.gg/UqXeVqUKQq)** — Get help, share ideas, and connect with other users
- **[🐛 Report Issues](https://github.com/milisp/mcp-linker/issues)** — Help us improve

---

📅 Roadmap

Planned features for upcoming versions:

- 📋 Copy Server Config — Easily copy configurations to share or backup
- 📥 Import Server Config — Load server config from local files
- 🌐 Auto Import via GitHub URL — Sync server config directly from a public GitHub link
- 🔁 Accept Server Config via PR or Issue — Let users submit server configs to the marketplace
- 🧩 Input Args Form UI — Auto-generate simple forms based on inputArgs, like MCPhub Desktop
- 🐳 One-Click Deploy to Docker — Launch server via MCPHub using Docker with one click

💡 Have more ideas? [Open an issue](https://github.com/milisp/mcp-linker/issues) or join the discussion on [Discord](https://discord.gg/UqXeVqUKQq)!

---

## 🎉 Amazing Contributors

We're grateful to our awesome community contributors who make MCP Linker better every day:

[![Contributors](https://contrib.rocks/image?repo=milisp/mcp-linker)](https://github.com/milisp/mcp-linker/graphs/contributors)

**Special thanks to:**

- [@eltociear](https://github.com/eltociear) — Japanese translation
- [@devilcoder01](https://github.com/devilcoder01) — Windows build compatibility, UI improvements, GitHub workflows 🛠️
