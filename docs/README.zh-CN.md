
<p align="center">
  <img src="../public/logo.png" alt="项目 Logo" width="200" />
</p>

<p align="center">
  📘 
  <a href="../README.md">English</a> | 
  <strong>简体中文</strong> | 
  <a href="./README.ja-JP.md">日本語</a>
</p>

<p align="center">
  <a href="https://github.com/milisp/mcp-linker/stargazers">
    ⭐ 如果你觉得这个项目有用，欢迎给一个 Star！
  </a>
  <br/>
  <a href="https://github.com/milisp/mcp-linker">
    <img src="https://img.shields.io/github/stars/milisp/mcp-linker?style=social" alt="GitHub stars"/>
    <img src="https://img.shields.io/github/forks/milisp/mcp-linker?style=social" alt="GitHub forks"/>
  </a>
</p>

# MCP Linker

[![GitHub last commit](https://img.shields.io/github/last-commit/milisp/mcp-linker)](https://github.com/milisp/mcp-linker/commits)
![build](https://github.com/milisp/mcp-linker/actions/workflows/tauri-ci-win.yml/badge.svg)

> 轻松将 MCP 服务器添加到 Claude Desktop、Cursor 和 Windsurf。跨平台。Tauri 图形界面。内置服务器管理功能。

---

## 📋 目录

- [用户指南](#-用户指南)
  - [下载](#-下载-mcp-linker)
  - [功能](#-功能)
  - [快速开始](#-快速开始)
  - [工作原理](#-工作原理)
  - [配置文件路径](#-配置文件路径)
  - [截图](#-截图)
- [开发者指南](#-开发者指南)
  - [系统要求](#-系统要求)
  - [安装步骤](#-安装步骤)
  - [故障排除](#-故障排除)
  - [参与贡献](#-参与贡献)
- [资源](#-资源)
  - [官方服务器](#-官方服务器)
  - [反馈与支持](#-反馈与支持)
  - [贡献者](#-贡献者)

---

# 👤 用户指南

## 🔽 下载 MCP Linker

👉 [在 🐙Gumroad 上下载](https://wei40680.gumroad.com/l/jdbuvc?wanted=true)  
👉 [在 GitHub Releases 上下载](https://github.com/milisp/mcp-linker/releases)

## ✨ 功能亮点

✅ 一键添加 MCP 服务器  
✅ 管理多个服务器配置（添加、删除、收藏）  
✅ 无需技术背景——只需点击即可开始  
✅ 开源且由社区驱动  
✅ 收藏 & 最近使用：快速访问常用服务器  
✅ 跨平台支持：macOS、Windows、Linux  
✅ 多语言支持：英文、中文、日文  
✅ 改进的错误处理和更友好的安装流程

> 🛠️ *即将推出：* 一键安装服务器、状态监控等功能！

## 🚀 快速开始

1. **选择** 一个 MCP 服务器  
2. 点击 **获取配置**  
3. 点击 **添加** 将其集成到你的 MCP 客户端  
4. 在收藏或历史记录中管理服务器

> 💡 收藏和最近使用的服务器将保存在本地，提升工作流效率。

## 🛠️ 工作原理

[Wiki](https://github.com/milisp/mcp-linker/wiki#-how-it-works)

## 🖼️ 截图

### 服务器发现
![Discover Screenshot](../images/home.png)

### 配置示例
![Config Screenshot](../images/config.png)

### 管理示例
![Manage Screenshot](../images/manager.png)

---

# 👨‍💻 开发者指南

## 💻 系统要求

在开发此项目之前，请确保已安装以下工具：

- Node.js >= 20 
- bun  
- Rust 工具链（稳定版）用于 Tauri

## 🔧 安装步骤

```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker
bun install
bun tauri dev
```

## 🔍 故障排除

[Wiki](https://github.com/milisp/mcp-linker/wiki#-troubleshooting)

## 🤝 参与贡献

我们欢迎社区贡献：

1. **Fork & Clone** 此仓库  
2. 为你的功能或修复 **创建分支**  
3. **提交 Pull Request**

---

# 📚 资源

## 🌐 官方服务器

请查看 [官方 MCP 服务器列表](https://github.com/modelcontextprotocol/servers?from=mcp-linker)

## 💬 反馈与支持

有问题或建议？欢迎加入我们的 [GitHub Discussions](https://github.com/milisp/mcp-linker/discussions)

## 🎉 贡献者

感谢以下贡献者改善本项目：

- [@eltociear](https://github.com/eltociear) — 日语翻译  
- [@devilcoder01](https://github.com/devilcoder01) — 改进 Windows 构建兼容性、项目安装说明、GitHub Workflow、UI 与设计

---

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)