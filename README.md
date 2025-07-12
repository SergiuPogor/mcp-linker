[中文](./docs/README.zh-CN.md) | [Deutsch](./docs/README.de.md) | [es](./docs/README.es.md) | [fr](./docs/README.fr.md) | [日本語](./docs/README.ja-JP.md) | [繁體中文](./docs/README.zh-Han.md)

# MCP Linker

MCP manage, one-click install and sync MCP (Model Context Protocol) servers across AI clients like Claude Code and Desktop, Cursor, and Cline — all via a lightweight Tauri GUI with a built-in MCP server marketplace.

<div align="center">

![MCP Linker Logo](./images/logo.png)

⚡️ **Say goodbye to copy-paste**

[![GitHub release](https://img.shields.io/github/release/milisp/mcp-linker.svg?style=for-the-badge&logo=github)](https://github.com/milisp/mcp-linker/releases)
[![Downloads](https://img.shields.io/github/downloads/milisp/mcp-linker/total.svg?style=for-the-badge&logo=github)](https://github.com/milisp/mcp-linker/releases)

### 🌟 **If this project is helpful to you, please give it a Star!** 🌟
[![GitHub stars](https://img.shields.io/github/stars/milisp/mcp-linker?style=for-the-badge&logo=github&color=yellow)](https://github.com/milisp/mcp-linker/stargazers)

---

### 🚀 Get Started in 30 Seconds

[🚀 Quick Start](#quick-start)

[📥 **Download Now**](https://github.com/milisp/mcp-linker/releases) 
  <span> and one click</span>

  [![mcp-linker-add](https://img.shields.io/badge/mcp--linker-add-blue?logo=link&style=for-the-badge)](https://www.mcp-linker.store/install-app?name=sequential-thinking&autoSubmit=true&config=eyJzZXF1ZW50aWFsLXRoaW5raW5nIjp7ImNvbW1hbmQiOiJucHgiLCJhcmdzIjpbIi15IiwiQG1vZGVsY29udGV4dHByb3RvY29sL3NlcnZlci1zZXF1ZW50aWFsLXRoaW5raW5nIl19fQ==)
  
  this will add sequential-thinking to your selected client

  Want to share your MCP server? Use our [mcp-linker-add Badge](https://mcp-linker.store/install-app) to let others one-click add it!

</div>

---

## ✨ Why Choose MCP Linker?

**The fastest way to supercharge your AI workflow**

MCP Linker = Marketplace + One-click Installer + Config Sync

![Demo](./images/demo.gif)

### 🎯 Key Features

- **🚀 One-Click adding** — No more manual config file editing
- **🔄 Multi-Client Support** — Claude Code and Desktop, Cursor, VS Code, Cline, Roo Code, Windsurf, and more
- **📦 600+ Curated Servers** — The build-in MCP server marketplace
- **🌐 Cross-Platform** — macOS, Windows, Linux (lightweight ~6MB)
- **🔍 Smart Detection** — Auto-detect and install Python, Node.js, uv environments
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

👉 Sync across devices or Team Members [Check out pricing plans](https://mcp-linker.store/pricing).

## 📸 Screenshots

🔍 Server Discovery ![Discover](./images/home.png)
⚙️ Configuration ![Config](./images/config.png) 

## 🛠️ Development

**Requirements:** Node.js 20+, Bun, Rust toolchain
[install Tauri](https://v2.tauri.app/start/prerequisites/)

```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker/tauri-app
bun install
cp .env.example .env
bun tauri dev
```

## 🏗️ Architecture

- **Frontend:** Tauri + React + shadcn/ui
- **Backend:** Optional FastAPI

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

**Found this helpful? Consider giving us a ⭐ to support the project!**
[![Star](https://img.shields.io/github/stars/milisp/mcp-linker?style=social)](https://github.com/milisp/mcp-linker/stargazers)


## 💬 Support & Community

- **[💬 Join Discussions](https://github.com/milisp/mcp-linker/discussions)** — Get help, share ideas, and connect with other users
- **[🐛 Report Issues](https://github.com/milisp/mcp-linker/issues)** — Help us improve

## 🎉 Amazing Contributors

We're grateful to our awesome community contributors who make MCP Linker better every day:

[![Contributors](https://contrib.rocks/image?repo=milisp/mcp-linker)](https://github.com/milisp/mcp-linker/graphs/contributors)

**Special thanks to:**

- [@eltociear](https://github.com/eltociear) — Japanese translation
- [@devilcoder01](https://github.com/devilcoder01) — Windows build compatibility, UI improvements, GitHub workflows 🛠️

## 📅 Roadmap

Planned features for upcoming versions:

- [ ] 📋 Copy Server Config — Easily copy configurations to share or backup
- [ ] 📥 Import Server Config — Load server config from local files
- [x] 🌐 Auto Import via GitHub URL — Sync server config directly from a public GitHub link
- [ ] 🧩 Input Args Form UI — Auto-generate simple forms based on inputArgs, like MCPhub Desktop
- [ ] 🐳 One-Click Deploy to Docker — Launch server via MCPHub using Docker with one click

---

## ⚠️ macOS "App is Damaged" Warning

macOS may show a misleading “App is damaged” warning when you open this app.

🎥 [How to Fix It (YouTube)](https://www.youtube.com/watch?v=MEHFd0PCQh4)

More context: [Misleading macOS Warning Repo](https://github.com/milisp/misleading-macos-damaged-warning)
