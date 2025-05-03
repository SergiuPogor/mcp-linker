<p align="center">
  <img src="public/logo.png" alt="Project Logo" width="200" />
</p>

<p align="center">
  📘 Available languages: 
  <strong>English</strong> | 
  <a href="./docs/README.zh-CN.md">简体中文</a> | 
  <a href="./docs/README.ja-JP.md">日本語</a>
</p>

<p align="center">
  <a href="https://github.com/milisp/mcp-linker/stargazers">
    ⭐ If you find this project useful, please consider giving it a star!
  </a>
  <br/>
  <a href="https://github.com/milisp/mcp-linker">
    <img src="https://img.shields.io/github/stars/milisp/mcp-linker?style=social" alt="GitHub stars"/>
    <img src="https://img.shields.io/github/forks/milisp/mcp-linker?style=social" alt="GitHub forks"/>
  </a>
</p>

# MCP Linker

> A simple yet powerful tool to manage **Model Context Protocol (MCP) servers** for clients like **Claude, Cursor, Windsurf**. With just two clicks—**Get** and **Add**—you can connect to a server. Supports macOS and Windows via a Tauri GUI. Linux comming soon.

---

## 📋 Table of Contents

- [For Users](#-for-users)
  - [Download](#-download-mcp-linker)
  - [Features](#-features)
  - [Quick Start Guide](#-quick-start-guide)
  - [How It Works](#-how-it-works)
  - [Configuration File Paths](#-configuration-file-paths)
  - [Screenshots](#-screenshots)
- [For Developers](#-for-developers)
  - [System Requirements](#-system-requirements)
  - [Installation Steps](#-installation-steps)
  - [Troubleshooting](#-troubleshooting)
  - [Contributing](#-contributing)
- [Resources](#-resources)
  - [Official Servers](#-official-servers)
  - [Feedback & Support](#-feedback--support)
  - [Contributors](#-contributors)

---

# 👤 For Users

## 🔽 Download MCP Linker

👉 [Download on 🐙Gumroad](https://wei40680.gumroad.com/l/jdbuvc?wanted=true)  
👉 [Download on GitHub Releases](https://github.com/milisp/mcp-linker/releases)

## ✨ Features

✅ One-click to add MCP servers  
✅ Manage multiple server configurations (add, delete, favorite)  
✅ Open-source and community-driven  
✅ Favorites & Recently Used: Quickly access your go-to servers  
✅ Cross-platform: macOS and experimental Windows support  
✅ Multi-language: English, 中文, 日本語  
✅ Improved error handling and user-friendly setup

> 🛠️ *Coming Soon:* One-click server install, status monitoring, and more!

## 🚀 Quick Start

1. **Select** an MCP server from the list.  
2. Click **Get** to view its configuration.  
3. Click **Add** to integrate it with your MCP client.  
4. Manage servers from your favorites or history.

> 💡 Favorites and recently used servers are saved locally to enhance your workflow.

## 🛠️ How It Works

When you click **"Add"**, MCP Linker directly modifies your MCP configuration file to include the selected server.

> ⚠️ Warning: This will overwrite existing MCP configuration for that client. Please back up your config file if needed.

## 📂 Configuration File Paths

**Claude Desktop**  
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
- **Windows**: `~/AppData/Roaming/Claude/claude_desktop_config.json`  

**Cursor**  
- **Global config**: `~/.cursor/mcp.json`  
- **Project config**: `.cursor/mcp.json`  

**Windsurf**  
- `~/.codeium/windsurf/mcp_config.json`

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

- Node.js 
- bun (or pnpm/yarn/npm)
- Rust toolchain (stable) for Tauri

## 🔧 Installation Steps

```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker
bun install
bun tauri dev
```

Alternative package managers:
```bash
# Using yarn
yarn install
yarn tauri dev

# Using pnpm
pnpm install
pnpm tauri dev

# Using npm
npm install
npm run tauri dev
```

## 🔍 Troubleshooting

If you encounter installation issues:

1. Remove dependency lock files:
   ```bash
   rm package-lock.json
   rm -rf node_modules
   ```

2. Clean npm cache and reinstall:
   ```bash
   npm cache clean --force
   npm install
   ```

3. If errors persist, try with legacy peer deps:
   ```bash
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

## 🤝 Contributing

We welcome contributions from the community:

1. **Fork & Clone** this repository
2. **Create a branch** for your feature or fix
3. **Submit a Pull Request** with your changes

---

# 📚 Resources

## 🌐 Official Servers

Check out the list of [official MCP servers](https://github.com/modelcontextprotocol/servers?from=mcp-linker).

## 💬 Feedback & Support

Have questions or suggestions? Join our [GitHub Discussions](https://github.com/milisp/mcp-linker/discussions).

## 🎉 Contributors

Thanks to the following contributors for improving this project:

- [@eltociear](https://github.com/eltociear) — Japanese translation
- [@devilcoder01](https://github.com/devilcoder01) — improved Windows build compatibility and project setup instructions, Github workflow, UI improved, design

---

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)