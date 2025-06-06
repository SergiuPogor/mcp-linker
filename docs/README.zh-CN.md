<p align="center">
  <img src="../public/logo.png" alt="项目 Logo" width="200" />
</p>

<p align="center">
  <a href="https://github.com/milisp/mcp-linker/stargazers">
    ⭐ 如果你觉得这个项目有用，欢迎给一个 Star！
  </a>
  <br/>
  <a href="https://github.com/milisp/mcp-linker">
    <img src="https://img.shields.io/github/stars/milisp/mcp-linker?style=social" alt="GitHub stars"/>
  </a>
</p>

# MCP Linker

[![GitHub last commit](https://img.shields.io/github/last-commit/milisp/mcp-linker)](https://github.com/milisp/mcp-linker/commits)
![build](https://github.com/milisp/mcp-linker/actions/workflows/tauri-ci-win.yml/badge.svg)

📘 [English](../README.md) | _简体中文_ | [日本語](./README.ja-JP.md)  

> 轻松将 MCP 服务器添加到 Claude Desktop、Cursor 和 Windsurf。跨平台。Tauri 图形界面。内置服务器管理功能。跨客户端同步配置

---

## 🚀 Reddit 推荐

🔥 [r/selfhosted：13K+ 浏览量](https://www.reddit.com/r/selfhosted/comments/1kfcwwn/introducing_mcp_linker_oneclick_setup_for_adding/)  
💬 [r/mcp：9.3K+ 浏览量](https://www.reddit.com/r/mcp/comments/1l34b93/mcp_manager_sync_config_across_clients_says_good/)


📣 “不错！我也在把类似的方法集成到一个工作产品中…”  
📢 欢迎加入讨论或分享你的看法！

---

## 📰 更新日志

- 2025-06-04: 同步服务器配置 Claude <=> 其他客户端.
- 2025-06-02：当服务器配置中的 `args` 字符串包含 `"path"` 字样时，显示 `git clone` 按钮  
- 2025-05-29：支持将收藏的服务器同步到云端  
- 2025-05-22：支持分享你的服务器，服务器列表新增排序选项  
- 2025-05-19：服务器列表支持按 GitHub Star 数排序  
- 2025-05-16：上线 MCP 服务器商店预览，已收录 600+ 服务器，持续增加中  
- 2025-05-08：支持添加自定义服务器

---

## 📋 目录

- [MCP Linker](#mcp-linker)
  - [🚀 Reddit 推荐](#-reddit-推荐)
  - [📰 更新日志](#-更新日志)
  - [📋 目录](#-目录)
- [👤 用户指南](#-用户指南)
  - [🔽 下载 MCP Linker](#-下载-mcp-linker)
  - [✨ 功能亮点](#-功能亮点)
  - [🚀 快速开始](#-快速开始)
  - [🛠️ 工作原理](#️-工作原理)
  - [🖼️ 截图](#️-截图)
    - [管理示例](#管理示例)
    - [服务器发现](#服务器发现)
    - [配置示例](#配置示例)
- [👨‍💻 开发者指南](#-开发者指南)
  - [💻 系统要求](#-系统要求)
  - [🔧 安装步骤](#-安装步骤)
  - [🔍 故障排除](#-故障排除)
  - [🤝 参与贡献](#-参与贡献)
- [📚 资源](#-资源)
  - [🌐 官方服务器](#-官方服务器)
  - [💬 反馈与支持](#-反馈与支持)
  - [🎉 贡献者](#-贡献者)

---

# 👤 用户指南

## 🔽 下载 MCP Linker

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

## 🚀 快速开始

1. **选择** 一个 MCP 服务器
2. 点击 **获取配置**
3. 点击 **添加** 将其集成到你的 MCP 客户端
4. 在收藏或历史记录中管理服务器

> 💡 收藏和最近使用的服务器将保存在本地，提升工作流效率。

## 🛠️ 工作原理

[Wiki](https://github.com/milisp/mcp-linker/wiki#-how-it-works)

## 🖼️ 截图

### 管理示例

![Manage Screenshot](../images/manage.png)
### 服务器发现

![Discover Screenshot](../images/home.png)

### 配置示例

![Config Screenshot](../images/config.png)


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

❤️ 喜欢MCP Linker吗？请在[GitHub](https://github.com/milisp/mcp-linker/stargazers)上给我们点星，支持持续开发！