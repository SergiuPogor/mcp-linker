# MCP Linker - One-Click MCP Server Manager for Claude Desktop & AI Clients

**⚡ Our goal: To build the best open-source MCP server manager in the world.**

<p align="center">
  <img src="public/logo.png" alt="Project Logo" width="200" />
</p>

> MCP Linker helps you configure and sync your MCP server settings across popular AI clients like Claude Desktop, VS Code, and Neovim. No more manual `git clone` or `copy-paste` — just click and connect.

<p align="center">
  <a href="https://github.com/milisp/mcp-linker/stargazers">
    ⭐ If you find this project useful, please consider giving it a star!
  </a>
  <br/>
  <a href="https://github.com/milisp/mcp-linker">
    <img src="https://img.shields.io/github/stars/milisp/mcp-linker?style=social" alt="
GitHub stars"/>
  </a>
  <a href="https://github.com/milisp/mcp-linker">
    <img src="https://img.shields.io/github/last-commit/milisp/mcp-linker" alt="Latest commit"/>
  </a>
  <img src="https://github.com/milisp/mcp-linker/actions/workflows/tauri-ci-win.yml/badge.svg" alt="Build status"/>
</p>

📘 _English_ | [简体中文](./docs/README.zh-CN.md) | [日本語](./docs/README.ja-JP.md)

> MCP Linker is a cross-platform GUI tool to easily add, manage, and sync Model Context Protocol (MCP) server configurations for Claude Desktop, Cursor, VS Code, Neovim, and other AI/LLM clients. With one-click setup and intuitive interface, no technical skill is required. Built with Tauri and FastAPI, it simplifies server integration and configuration sharing.

## 🚀 Featured on Reddit

💬 [r/mcp: 11K+ views](https://www.reddit.com/r/mcp/comments/1l34b93/mcp_manager_sync_config_across_clients_says_good/)   
🔥 [r/selfhosted: 13K+ views](https://www.reddit.com/r/selfhosted/comments/1kfcwwn/introducing_mcp_linker_oneclick_setup_for_adding/)  

📣 "Nice! I'm building a similar approach into a work product..."  
📢 Join the discussion or share your thoughts!


## News

- 2025-06-04: Sync server configs between Claude and other clients. Enable or disable servers.
- 2025-06-02: Show `git clone` button when the server config's `args` contains the word `"path"`    
- 2025-05-29: Sync favorite servers to the cloud.
- 2025-05-22: Share your servers. server list sort by more choice
- 2025-05-19: server list sort by github stars  
- 2025-05-16: online MCP servers store preview, more than 600 serveres, will add more.
- 2025-05-08: Support adding custom server  

🙌 Developers welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) if you'd like to help improve MCP Linker.

---

## 📋 Table of Contents
- [MCP Linker - One-Click MCP Server Manager for Claude Desktop \& AI Clients](#mcp-linker---one-click-mcp-server-manager-for-claude-desktop--ai-clients)
  - [🚀 Featured on Reddit](#-featured-on-reddit)
  - [News](#news)
  - [📋 Table of Contents](#-table-of-contents)
- [👤 For Users](#-for-users)
  - [🔽 Download](#-download)
  - [✨ Key Features of MCP Linker: One-Click MCP Server Manager](#-key-features-of-mcp-linker-one-click-mcp-server-manager)
  - [🚀 Quick Start](#-quick-start)
  - [🛠️ How It Works](#️-how-it-works)
  - [🖼️ Screenshots](#️-screenshots)
    - [Manage Example](#manage-example)
    - [Server Discovery](#server-discovery)
    - [Configuration Example](#configuration-example)
- [👨‍💻 For Developers](#-for-developers)
  - [🤝 Contributing](#-contributing)
  - [💻 System Requirements](#-system-requirements)
  - [🔧 Installation Steps](#-installation-steps)
  - [🔍 Troubleshooting](#-troubleshooting)
- [📚 Resources](#-resources)
  - [🌐 Servers](#-servers)
  - [💬 Feedback \& Support](#-feedback--support)
  - [🎉 Contributors](#-contributors)

---

# 👤 For Users

## 🔽 Download

👉 [Download on GitHub Releases](https://github.com/milisp/mcp-linker/releases)

## ✨ Key Features of MCP Linker: One-Click MCP Server Manager

✅ One-click to add MCP servers, less copy paste need     
✅ Manage multiple server configurations (add, delete, favorite)  
✅ No technical skills required — just click and go!  
✅ Open-source and community-driven  
✅ Favorites & Recently Used: Quickly access your go-to servers  
✅ Cross-platform: macOS, Windows, Linux support  
✅ Multi-language: English, 中文, 日本語  
✅ Auto detect python, uv, node   
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

### Manage Example
![Manage Screenshot](./images/manage.png)

### Server Discovery
![Discover Screenshot](./images/home.png)

### Configuration Example
![Config Screenshot](./images/config.png)

---

# 👨‍💻 For Developers

## 🤝 Contributing

Contributions are welcome! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get started.

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

# create a .env file at project root and set env
cp .env.example .env
VITE_API_BASE_URL=https://api.mcp-linker.store/api/v1

bun tauri dev
```

## 🔍 Troubleshooting

[Wiki](https://github.com/milisp/mcp-linker/wiki#-troubleshooting)

---

# 📚 Resources

## 🌐 Servers

- [official MCP servers](https://github.com/modelcontextprotocol/servers).
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)

## 💬 Feedback & Support

Have questions or suggestions? 👉 Join our [Discord community](https://discord.gg/G9uJxjpd) 

## 🎉 Contributors

Thanks to the following contributors for improving this project:

- [@eltociear](https://github.com/eltociear) — Japanese translation
- [@devilcoder01](https://github.com/devilcoder01) — improved Windows build compatibility and project setup instructions, Github workflow, UI improved, design

---
**Keywords**: MCP, Claude Desktop, MCP server manager, AI client integration, Tauri app, LLM config sync, cross-platform GUI, FastAPI backend

❤️ Enjoying MCP Linker? [Star us on GitHub](https://github.com/milisp/mcp-linker/stargazers) to support continued development!