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

> Easily add a **Model Context Protocol (MCP) server** to your MCP client (**Claude, Cursor, Windsurf...**) with just two clicks: **Get** and **Add**. Supports macOS and Windows.

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
✅ Supports multiple MCP server configurations  
✅ Open-source and community-driven  
✅ Favorites: Mark servers as favorites for quick access  
✅ Recently Used: Automatically save and display recently added servers  
✅ Windows Support: Now also works on Windows (experimental)  
✅ Improved error handling and installation guide

## 🚀 Quick Start Guide

1. **Browse & Select**: Choose an MCP server from the available list.  
2. **Install**: Click **"Get"** to show configuration of server.  
3. **Activate**: Click **"Add"** to integrate it with your MCP client.

> **Tip:** Favorites and recently used servers are saved locally for your convenience!

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

Check out the list of [official MCP servers](https://github.com/modelcontextprotocol/servers).

## 💬 Feedback & Support

Have questions or suggestions? Join our [GitHub Discussions](https://github.com/milisp/mcp-linker/discussions).

## 🎉 Contributors

Thanks to the following contributors for improving this project:

- [@eltociear](https://github.com/eltociear) — Japanese translation
- [@devilcoder01](https://github.com/devilcoder01) — improved Windows build compatibility and project setup instructions

---

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)