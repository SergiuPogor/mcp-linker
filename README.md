<div align="center">

![MCP Linker Logo](./images/logo.png)

**Created by [milisp](https://github.com/milisp) — Building the AI tools of tomorrow**

# MCP Linker

[![English](https://img.shields.io/badge/English-Click-yellow)](README.md)
[![繁體中文](https://img.shields.io/badge/繁體中文-點擊查看-orange)](./readme/README.zh-TW.md)
[![简体中文](https://img.shields.io/badge/简体中文-点击查看-orange)](./readme/README.zh-CN.md)
[![日本語](https://img.shields.io/badge/日本語-クリック-青)](./readme/README.ja-JP.md)
[![Deutsch](https://img.shields.io/badge/Deutsch-Klick-blue)](./readme/README.de.md)
[![Español](https://img.shields.io/badge/Español-Clic-blue)](./readme/README.es.md)
[![Français](https://img.shields.io/badge/Français-Cliquez-blue)](./readme/README.fr.md)

[![Stars](https://img.shields.io/github/stars/milisp/mcp-linker?style=social)](https://github.com/milisp/mcp-linker/stargazers)
[![Forks](https://img.shields.io/github/forks/milisp/mcp-linker?style=social)](https://github.com/milisp/mcp-linker/network/members)
[![Downloads](https://img.shields.io/github/downloads/milisp/mcp-linker/total.svg)](https://github.com/milisp/mcp-linker/releases)


**One-click add and sync MCP (Model Context Protocol) servers across AI clients like Claude Code, Desktop, Cursor, and Cline.**

![Demo](./images/demo.gif)

support [awesome-claude-dxt](https://github.com/milisp/awesome-claude-dxt) - A curated list of awesome (not only Claude) Desktop Extensions - by milisp

### 🚀 **Get Started in 30 Seconds — Say Goodbye to Copy-Paste**

<a href="https://github.com/milisp/mcp-linker/releases" target="_blank">
  <img src="https://img.shields.io/badge/📥%20Download%20Latest-macOS%2FWindows%2FLinux-brightgreen?style=for-the-badge&logo=github" alt="Download MCP Linker" />
</a>
<br />

[![mcp-linker-add](https://img.shields.io/badge/mcp--linker-add-blue?logo=link&style=for-the-badge)](https://www.mcp-linker.store/install-app?name=sequential-thinking&autoSubmit=true&config=eyJzZXF1ZW50aWFsLXRoaW5raW5nIjp7ImNvbW1hbmQiOiJucHgiLCJhcmdzIjpbIi15IiwiQG1vZGVsY29udGV4dHByb3RvY29sL3NlcnZlci1zZXF1ZW50aWFsLXRoaW5raW5nIl19fQ==)

*Try it now — this will add sequential-thinking server to your selected client*

[🏷️ mcp-linker-add badge & Social](https://mcp-linker.store/install-app) - See how easy to share your mcp server for users

</div>

## 👤 Who Is It For?

For mcp server users and creators

## ✨ Key Features

- **🚀 Two click get and add** — Click get to show mcp config, then add to selected client
- **🔄 Multi-Client Support** — Claude Code/Desktop, Cursor, VS Code, Cline, Roo Code, Windsurf, custom any client
- **📦 600+ Curated MCP Servers** — Built-in MCP server marketplace
  - sequential-thinking, context7, desktop-commander and more
- **🌐 Cross-Platform** — macOS, Windows, Linux (lightweight ~6MB)
- **🔍 Smart Detection** — Auto-detect Python, Node.js, uv environments
- **☁️ Cloud Sync** — Sync configs across devices (Pro feature)

## 🚀 Quick Start

1. **[📥 Download the latest release](https://github.com/milisp/mcp-linker/releases)**
2. **🔍 Browse** the curated MCP server marketplace
3. **Click "get"** to show mcp server configure
4. **➕ Click "add"** to add mcp server configure to selected mcp client
5. **🎉 Done!** Your AI client now has new capabilities

## 📸 Screenshots

### 🔍 Server Discovery
![Discover](./images/discover.png)

### ⚙️ Add server
![Add server](./images/add-server.png)

## 🚀 Upgrade to Pro

🔐 Want cloud sync, backup, and team support?  
👉 [**See Pro Plans →**](https://mcp-linker.store/pricing)

<sub>Starts at less than the price of a coffee per month ☕</sub>

## 👤 About the Creator

**MCP Linker** is created and maintained by [**milisp**](https://github.com/milisp),  
a passionate developer building tools at the frontier of AI + developer productivity.

🔗 Check out other projects by milisp:  
- [awesome-claude-dxt](https://github.com/milisp/awesome-claude-dxt) – Curated list of Claude Desktop Extensions  

Follow me On [Twitter](https://x.com/mikelelisp) or ⭐ to stay updated on cutting-edge tools for the Claude/MCP ecosystem!

## 📚 Documentation

- [📅 Roadmap](./readme/ROADMAP.md)
- [🍎 macOS Notice](./readme/MACOS-NOTICE.md)

## Install

Just download and open

### macOS special Install Information

> Apple say "App is damaged"

This is 100% opensource

### How to Open Unsigned Apps on macOS

> follow this or ask AI or search.

1. Try to open the app normally
2. If blocked, go to System Preferences → Security & Privacy
3. Click "Open Anyway" next to the blocked app message
4. Or use the command line: 

```sh
xattr -d com.apple.quarantine /path/to/MCPLinker.app
```

5. Or watch Youtube

🎥 [Youtube Video: How to Fix It](https://www.youtube.com/watch?v=MEHFd0PCQh4)

## 🛠️ Development Setup

**Requirements:** Node.js 20+, Bun, Rust toolchain, [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Getting Started

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

## 💬 Support & Community

- **[💬 Join Discussions](https://github.com/milisp/mcp-linker/discussions)** — Get help and share ideas
- **[🐛 Report Issues](https://github.com/milisp/mcp-linker/issues)** — Help us improve

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to the project.

## 🎉 Amazing Contributors

We're grateful to our awesome community contributors who make MCP Linker better every day:

[![Contributors](https://contrib.rocks/image?repo=milisp/mcp-linker)](https://github.com/milisp/mcp-linker/graphs/contributors)

**Special thanks to:**

- [@eltociear](https://github.com/eltociear) — Japanese translation
- [@devilcoder01](https://github.com/devilcoder01) — Windows build compatibility, UI improvements, GitHub workflows 🛠️

---

## 🔐 Security & Privacy

- **Local First**: All configurations are stored locally by default
- **Optional Cloud Sync**: Pro users can opt-in to encrypted cloud synchronization
- **Open Source**: Full transparency with public source code
- **No Tracking**: No collect personal usage data

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🧠 Keywords

Claude plugin manager, Claude tool integration, Model Context Protocol (MCP), MCP server discovery, MCP linker, AI client sync, Claude Code config tool, Claude Desktop automation, JSON-RPC Claude plugins, manifest.json installer, cross-platform AI tooling, tauri Claude client, Claude plugin marketplace, config-free Claude setup, AI config distribution, Claude Pro features

**Found this helpful? Please give us a ⭐ to support the project!**