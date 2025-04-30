<p align="center">
  <img src="../public/logo.png" alt="Project Logo" width="200" />
</p>

<p align="center">
  📘 语言切换：
  <a href="../README.md">English</a> |
  <strong>简体中文</strong> |
  <a href="./README.ja-JP.md">日本語</a>
</p>

<p align="center">
  <a href="https://github.com/milisp/mcp-linker/stargazers">
    ⭐ 如果你觉得这个项目对你有帮助，欢迎点个 star 支持一下！
  </a>
  <br/>
  <a href="https://github.com/milisp/mcp-linker">
    <img src="https://img.shields.io/github/stars/milisp/mcp-linker?style=social" alt="GitHub stars"/>
    <img src="https://img.shields.io/github/forks/milisp/mcp-linker?style=social" alt="GitHub forks"/>
  </a>
</p>

# MCP Linker

>轻松将 **Model Context Protocol (MCP) 服务器** 添加到你的 MCP 客户端（例如 Claude Cursor windsurf...），只需两步操作：**获取** 与 **添加**。支持 macos win

## 🔧 环境要求

在运行本项目之前，请确保已安装以下工具：

- Node.js
- bun（或 pnpm）
- Rust 工具链（稳定版），用于构建 Tauri 应用

## 🔽 Download MCP Linker

👉 [在 🐙Gumroad 下载](https://wei40680.gumroad.com/l/jdbuvc?wanted=true)
👉 [在 GitHub 发布页下载](https://github.com/milisp/mcp-linker/releases)

## ✨ 功能特色

✅ 一键添加 MCP 服务器
✅ 支持多个 MCP 服务器配置  
✅ 开源并由社区驱动  
✅ 收藏夹功能：可将服务器加入收藏，便于快速访问  
✅ 最近使用：自动保存并展示最近添加的服务器  
✅ 支持 Windows：现已支持 Windows 平台（实验性）  
✅ 更好的错误处理与安装指南  

🗨 [反馈或提问](https://github.com/milisp/mcp-linker/discussions)

## 安装

```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker
bun install
bun tauri dev
# yarn install
# yarn tauri dev
# pnpm install
# pnpm tauri dev
```

> **注意：** 如遇安装问题，可尝试删除 `package-lock.json` 和 `node_modules` 目录，然后执行以下命令：
> ```bash
> npm install --legacy-peer-deps
> ```

## 🚀 快速开始

1. **浏览与选择**：从可用服务器列表中选择一个 MCP 服务器。  
2. **安装**：点击 **“获取”** 查看服务器配置。  
3. **激活**：点击 **“添加”** 将其集成到你的 MCP 客户端。  

> 💡 提示：收藏与最近使用的服务器会被保存在本地，方便下次使用！

## 🌐 官方服务器

查看 [官方 MCP 服务器列表](https://github.com/modelcontextprotocol/servers)。

## 🖼️ 截图演示

### 服务器发现
![发现截图](../images/home.png)

### 配置示例
![配置截图](../images/config.png)

### 管理示例
![管理截图](../images/manager.png)

## 🤝 参与贡献

欢迎任何形式的贡献！添加你自己的 MCP 服务器只需：

1. **Fork 并克隆** 此仓库。  
2. **提交 Pull Request** 提交你的更改。  

## 🎉 贡献者

感谢以下贡献者对本项目的改进：

- [@eltociear](https://github.com/eltociear) — 日文翻译
- [@devilcoder01](https://github.com/devilcoder01) — 改进了 Windows 兼容性与项目安装说明

---

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)