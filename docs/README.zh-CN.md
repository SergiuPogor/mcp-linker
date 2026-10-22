<div align="center">

<img src="../src-tauri/icons/128x128.png" alt="MCP Linker Logo" width="200" />

# MCP Linker

[![GitHub Release](https://img.shields.io/github/v/release/milisp/mcp-linker?color=2ea44f&logo=github)](https://github.com/milisp/mcp-linker/releases)
[![GitHub Stars](https://img.shields.io/github/stars/milisp/mcp-linker?color=yellow&logo=github)](https://github.com/milisp/mcp-linker/stargazers)
[![Downloads](https://img.shields.io/github/downloads/milisp/mcp-linker/total?color=blue)](https://github.com/milisp/mcp-linker/releases)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../CONTRIBUTING.md)

[English](../README.md) · **简体中文** · [繁體中文](./README.zh-TW.md) · [日本語](./README.ja-JP.md) · [Deutsch](./README.de.md) · [Français](./README.fr.md) · [Español](./README.es.md)

**一键添加并同步 MCP 服务器、Skills 和插件到各类 AI 客户端——无需调用 LLM，内置应用市场**

[![Download](https://img.shields.io/badge/Download-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-2ea44f?style=for-the-badge&logo=github)](https://github.com/milisp/mcp-linker/releases/latest)

`brew install mcplinker` · [更多安装方式](#安装)

</div>

> [!TIP]
> ⭐ 给仓库点个 Star，并在 [Twitter](https://x.com/lisp_mi) 和 [GitHub](https://github.com/milisp) 上关注 **milisp**，获取更多内容！

![本地同步：将服务器从 Claude Code 复制到 Codex](../images/sync-to-codex.webp)

## 🚀 为什么选择 MCP Linker？

- ⚡ **快速** — 几秒钟内添加 MCP 服务器、Skills 和插件
- 🧠 **多客户端支持** — 兼容所有主流 AI 客户端

## ✨ 功能特性

- **本地同步** — 在多个客户端之间同步 MCP 服务器配置
- **官方 MCP Registry** — 直接从 registry.modelcontextprotocol.io 浏览并安装服务器
- **Skills** — 精选与社区目录，可从任意 GitHub 仓库安装，并针对 Claude Code 和 Codex 按客户端启用。目录结构与 `npx skills` 一致。[查看详情](./skills.md)
- **插件** — 浏览 Claude Code 和 Codex 的插件市场，并在同步面板中在两者之间复制插件。[查看详情](./plugins.md)
- **多客户端支持** — Claude Desktop/Code、Codex、Cursor、VS Code、GitHub Copilot CLI、Cline、OpenCode、Pi、Hermes Agent。[查看详情](./clients.md)
- **跨平台** — macOS、Windows、Linux
- **智能检测** — 自动检测 Python、Node.js、uv 环境

## 🚀 快速开始

### 安装

**macOS (Homebrew)**
```bash
brew install mcplinker
```

**Arch Linux (AUR)**
```bash
yay -S mcp-linker-bin
```

**GitHub Releases（预编译二进制文件）**
[下载](https://github.com/milisp/mcp-linker/releases)

> [!Note]
> 如果你已订阅，首次登录后请重新启动应用。

### 开始使用

1. 在内置应用市场中**浏览** MCP 服务器
2. 点击 **"Get"** 查看配置
3. 点击 **"Add"** 安装到你选择的客户端
4. **完成！** 立即开始使用新的 AI 能力

### CLI

`mcpl` 可以在终端中完成同样的操作，无需安装应用：`npm install -g @milisp/mcpl`，
或使用 `npx @milisp/mcpl` 直接试用。二进制文件见 [`mcpl-v*` 发布页](https://github.com/milisp/mcp-linker/releases)。

```bash
# Add one server to Claude Code, Codex and Cursor at once
mcpl add fs -c claude-code -c codex -c cursor -- npx -y @modelcontextprotocol/server-filesystem ~/work

mcpl ls                                  # every client on this machine
mcpl sync --from claude-code --to codex  # copy servers between clients (license)
mcpl skill install owner/repo            # install skills for Claude Code and Codex
mcpl plugin ls                           # plugins of Claude Code and Codex
```

所有命令请参阅 [cli.md](./cli.md)。

## 截图

| 项目间的本地同步 | 服务器发现 | 管理 |
|-----------------------------|------------------|--------|
| ![Claude Code 项目之间的本地同步](../images/sync-projects.webp) | ![发现](../images/discover.webp) | ![管理](../images/manage.webp) |

## 什么是 MCP？
Model Context Protocol 就像 AI 世界的 USB-C——一种将 AI 模型连接到不同数据源和工具的标准方式。

## 🤝 添加你的 MCP 服务器

开发了 MCP 服务器，或为你的产品运营着一个？**欢迎提交到目录。** 只要是可用且安全的服务器，无论多新都欢迎。提交一个 Pull Request，添加一个 JSON 文件即可：参见[如何添加服务器](../registry/README.md#adding-a-server)和[收录标准](../CONTRIBUTING.md#listing-an-mcp-server)。

开发了 Claude Code 插件（MCP 服务器 + Skills）？**也可以收录**：在插件市场中添加一个指向你仓库的条目。参见[提交你的插件](../plugins/README.md#submitting-your-plugin)。

有 Skill（`SKILL.md`）？**收录到 Skills 页面**：在 [`skills/catalog.json`](../skills/catalog.json) 中添加一个条目。参见 [skills.md](./skills.md)。

## 🧭 相关项目

- [milisp/codexia](http://github.com/milisp/codexia) - 面向 Codex 和 Claude Code 的 Agent 工作站。
- [**awesome-claude-dxt**](https://github.com/milisp/awesome-claude-dxt) — Claude Desktop 扩展（dxt）、工具和资源的精选列表
- [**awesome-codex-cli**](https://github.com/milisp/awesome-codex-cli) — Codex 工具、插件、Skills、MCP 的精选列表

## 💬 社区与支持

- [💬 加入 Discord](https://discord.gg/zAjtD4kf5K)
- [💬 参与讨论](https://github.com/milisp/mcp-linker/discussions)
- [🐛 反馈问题](https://github.com/milisp/mcp-linker/issues)

## 🛠️ 开发

开发命令和贡献指南请参阅 [CONTRIBUTING](../CONTRIBUTING.md)

## 🔍 故障排查

请查看 [Wiki](https://github.com/milisp/mcp-linker/wiki)

## 💖 贡献者

感谢所有出色的贡献者！

<a href="https://github.com/milisp/mcp-linker/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=milisp/mcp-linker" />
</a>

## 许可证

MCP Linker 采用 **AGPL-3.0** 与**商业许可证**双重授权。

- **AGPL-3.0** — 适用于开源使用。
- **商业许可证** — 闭源、专有、托管或 SaaS 使用场景需要。

---
**觉得有帮助？请给项目点个 ⭐！**

## 📈 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)
