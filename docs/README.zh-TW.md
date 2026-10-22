<div align="center">

<img src="../src-tauri/icons/128x128.png" alt="MCP Linker Logo" width="200" />

# MCP Linker

[![GitHub Release](https://img.shields.io/github/v/release/milisp/mcp-linker?color=2ea44f&logo=github)](https://github.com/milisp/mcp-linker/releases)
[![GitHub Stars](https://img.shields.io/github/stars/milisp/mcp-linker?color=yellow&logo=github)](https://github.com/milisp/mcp-linker/stargazers)
[![Downloads](https://img.shields.io/github/downloads/milisp/mcp-linker/total?color=blue)](https://github.com/milisp/mcp-linker/releases)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../CONTRIBUTING.md)

[English](../README.md) · [简体中文](./README.zh-CN.md) · **繁體中文** · [日本語](./README.ja-JP.md) · [Deutsch](./README.de.md) · [Français](./README.fr.md) · [Español](./README.es.md)

**一鍵新增並同步 MCP 伺服器、Skills 與外掛至各種 AI 用戶端——無需呼叫 LLM，內建應用市集**

[![Download](https://img.shields.io/badge/Download-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-2ea44f?style=for-the-badge&logo=github)](https://github.com/milisp/mcp-linker/releases/latest)

`brew install mcplinker` · [更多安裝方式](#安裝)

</div>

> [!TIP]
> ⭐ 幫儲存庫按個 Star，並在 [Twitter](https://x.com/lisp_mi) 和 [GitHub](https://github.com/milisp) 追蹤 **milisp**，獲得更多資訊！

![本機同步：將伺服器從 Claude Code 複製到 Codex](../images/sync-to-codex.webp)

## 🚀 為什麼選擇 MCP Linker？

- ⚡ **快速** — 幾秒內就能新增 MCP 伺服器、Skills 與外掛
- 🧠 **多用戶端支援** — 相容所有主流 AI 用戶端

## ✨ 功能特色

- **本機同步** — 在多個用戶端之間同步 MCP 伺服器設定
- **官方 MCP Registry** — 直接從 registry.modelcontextprotocol.io 瀏覽並安裝伺服器
- **Skills** — 精選與社群目錄，可從任何 GitHub 儲存庫安裝，並針對 Claude Code 與 Codex 依用戶端啟用。目錄結構與 `npx skills` 相同。[查看詳情](./skills.md)
- **外掛** — 瀏覽 Claude Code 與 Codex 的外掛市集，並在同步面板中於兩者之間複製外掛。[查看詳情](./plugins.md)
- **多用戶端支援** — Claude Desktop/Code、Codex、Cursor、VS Code、GitHub Copilot CLI、Cline、OpenCode、Pi、Hermes Agent。[查看詳情](./clients.md)
- **跨平台** — macOS、Windows、Linux
- **智慧偵測** — 自動偵測 Python、Node.js、uv 環境

## 🚀 快速開始

### 安裝

**macOS (Homebrew)**
```bash
brew install mcplinker
```

**Arch Linux (AUR)**
```bash
yay -S mcp-linker-bin
```

**GitHub Releases（預先編譯的執行檔）**
[下載](https://github.com/milisp/mcp-linker/releases)

> [!Note]
> 如果你已訂閱，首次登入後請重新啟動應用程式。

### 開始使用

1. 在內建應用市集中**瀏覽** MCP 伺服器
2. 點擊 **"Get"** 顯示設定
3. 點擊 **"Add"** 安裝到你選擇的用戶端
4. **完成！** 立即開始使用新的 AI 功能

### CLI

`mcpl` 可以在終端機中完成同樣的操作，不需要安裝應用程式：`npm install -g @milisp/mcpl`，
或使用 `npx @milisp/mcpl` 直接試用。執行檔請見 [`mcpl-v*` 發行頁](https://github.com/milisp/mcp-linker/releases)。

```bash
# Add one server to Claude Code, Codex and Cursor at once
mcpl add fs -c claude-code -c codex -c cursor -- npx -y @modelcontextprotocol/server-filesystem ~/work

mcpl ls                                  # every client on this machine
mcpl sync --from claude-code --to codex  # copy servers between clients (license)
mcpl skill install owner/repo            # install skills for Claude Code and Codex
mcpl plugin ls                           # plugins of Claude Code and Codex
```

所有指令請參閱 [cli.md](./cli.md)。

## 截圖

| 專案之間的本機同步 | 伺服器探索 | 管理 |
|-----------------------------|------------------|--------|
| ![Claude Code 專案之間的本機同步](../images/sync-projects.webp) | ![探索](../images/discover.webp) | ![管理](../images/manage.webp) |

## 什麼是 MCP？
Model Context Protocol 就像 AI 世界的 USB-C——一種將 AI 模型連接到各種資料來源與工具的標準方式。

## 🤝 新增你的 MCP 伺服器

開發了 MCP 伺服器，或為你的產品營運著一個？**歡迎提交到目錄。** 只要是可用且安全的伺服器，無論多新都歡迎。提交一個 Pull Request，新增一個 JSON 檔案即可：請參閱[如何新增伺服器](../registry/README.md#adding-a-server)與[收錄標準](../CONTRIBUTING.md#listing-an-mcp-server)。

開發了 Claude Code 外掛（MCP 伺服器 + Skills）？**也可以收錄**：在外掛市集中新增一個指向你儲存庫的項目。請參閱[提交你的外掛](../plugins/README.md#submitting-your-plugin)。

有 Skill（`SKILL.md`）？**收錄到 Skills 頁面**：在 [`skills/catalog.json`](../skills/catalog.json) 中新增一個項目。請參閱 [skills.md](./skills.md)。

## 🧭 相關專案

- [milisp/codexia](http://github.com/milisp/codexia) - 適用於 Codex 與 Claude Code 的 Agent 工作站。
- [**awesome-claude-dxt**](https://github.com/milisp/awesome-claude-dxt) — Claude Desktop 擴充功能（dxt）、工具與資源的精選清單
- [**awesome-codex-cli**](https://github.com/milisp/awesome-codex-cli) — Codex 工具、外掛、Skills、MCP 的精選清單

## 💬 社群與支援

- [💬 加入 Discord](https://discord.gg/zAjtD4kf5K)
- [💬 參與討論](https://github.com/milisp/mcp-linker/discussions)
- [🐛 回報問題](https://github.com/milisp/mcp-linker/issues)

## 🛠️ 開發

開發指令與貢獻指南請參閱 [CONTRIBUTING](../CONTRIBUTING.md)

## 🔍 疑難排解

請參閱 [Wiki](https://github.com/milisp/mcp-linker/wiki)

## 💖 貢獻者

感謝所有優秀的貢獻者！

<a href="https://github.com/milisp/mcp-linker/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=milisp/mcp-linker" />
</a>

## 授權條款

MCP Linker 採用 **AGPL-3.0** 與**商業授權**雙重授權。

- **AGPL-3.0** — 適用於開源使用。
- **商業授權** — 閉源、專有、託管或 SaaS 使用情境需要。

---
**覺得有幫助嗎？請幫專案按個 ⭐！**

## 📈 Star 歷史

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)
