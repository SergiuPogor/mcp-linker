# MCP Linker

📘 _English_ | [简体中文](./docs/README.zh-CN.md) | [日本語](./docs/README.ja-JP.md) 
 
[![GitHub last commit](https://img.shields.io/github/last-commit/milisp/mcp-linker)](https://github.com/milisp/mcp-linker/commits)
![build](https://github.com/milisp/mcp-linker/actions/workflows/tauri-ci-win.yml/badge.svg)

> Add MCP servers to Claude Desktop, Cursor, Windsurf, VS Code, Cline, neovim, and more — in two clicks. Cross-platform. Tauri GUI. Server management included.

## News

- 2025-05-22: You can add your servers for other people, server list sort by more choice
- 2025-05-19: server list sort by github stars  
- 2025-05-16: online MCP servers store preview, more than 600 serveres, will add more.
- 2025-05-08: Support adding custom server  

---

## 📋 Table of Contents
- [MCP Linker](#mcp-linker)
  - [News](#news)
  - [📋 Table of Contents](#-table-of-contents)
- [👤 For Users](#-for-users)
  - [🔽 Download](#-download)
  - [✨ Features](#-features)
  - [🚀 Quick Start](#-quick-start)
  - [🛠️ How It Works](#️-how-it-works)
  - [🖼️ Screenshots](#️-screenshots)
    - [Server Discovery](#server-discovery)
    - [Configuration Example](#configuration-example)
    - [Manage Example](#manage-example)
- [👨‍💻 For Developers](#-for-developers)
  - [💻 System Requirements](#-system-requirements)
  - [🔧 Installation Steps](#-installation-steps)
  - [🔍 Troubleshooting](#-troubleshooting)
  - [🤝 Contributing](#-contributing)
- [📚 Resources](#-resources)
  - [🌐 Servers](#-servers)
  - [💬 Feedback \& Support](#-feedback--support)
  - [🎉 Contributors](#-contributors)

---

# 👤 For Users

## 🔽 Download

👉 [Download on GitHub Releases](https://github.com/milisp/mcp-linker/releases)

## ✨ Features

✅ One-click to add MCP servers  
✅ Manage multiple server configurations (add, delete, favorite)  
✅ No technical skills required — just click and go!  
✅ Open-source and community-driven  
✅ Favorites & Recently Used: Quickly access your go-to servers  
✅ Cross-platform: macOS, Windows, Linux support  
✅ Multi-language: English, 中文, 日本語  
✅ Improved error handling and user-friendly setup  
✅ The server install by uvx or npx base the command

## 🚀 Quick Start

1. **Select** an MCP server from the list.  
2. Click **Get** to view its configuration.  
3. Click **Add** to integrate it with your MCP client.  
4. Manage servers from your favorites or history.

> 💡 Favorites and recently used servers are saved locally to enhance your workflow.

## 🛠️ How It Works

[Wiki](https://github.com/milisp/mcp-linker/wiki#-how-it-works)

## 🖼️ Screenshots

### Server Discovery
![Discover Screenshot](./images/home.png)

### Configuration Example
![Config Screenshot](./images/config.png)

### Manage Example
![Manage Screenshot](./images/manager.png)

---

# 👨‍💻 For Developers

## 💻 System Requirements

Before working on this project, ensure you have the following installed:

- Node.js >= 20
- bun
- Rust toolchain (stable) for Tauri

## 🔧 Installation Steps

```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker
bun install
bun tauri dev

# create a .env file at project root and set env
cp .env.example .env
VITE_API_BASE_URL=https://mcp-linker-api.onrender.com/api/v1
```

## 🔍 Troubleshooting

[Wiki](https://github.com/milisp/mcp-linker/wiki#-troubleshooting)

## 🤝 Contributing

We welcome contributions from the community:

1. **Fork & Clone** this repository
2. **Create a branch** for your feature or fix
3. **Submit a Pull Request** with your changes

---

# 📚 Resources

## 🌐 Servers

Check out the list of [official MCP servers](https://github.com/modelcontextprotocol/servers).

[awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)

## 💬 Feedback & Support

Have questions or suggestions? Join our [GitHub Discussions](https://github.com/milisp/mcp-linker/discussions).


## 🎉 Contributors

Thanks to the following contributors for improving this project:

- [@eltociear](https://github.com/eltociear) — Japanese translation
- [@devilcoder01](https://github.com/devilcoder01) — improved Windows build compatibility and project setup instructions, Github workflow, UI improved, design