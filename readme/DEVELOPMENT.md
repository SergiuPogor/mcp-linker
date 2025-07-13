# Development Guide

## 🛠️ Development Setup

**Requirements:** 
- Node.js 20+
- Bun
- Rust toolchain
- [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

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

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

**Found this helpful? Consider giving us a ⭐ to support the project!**
[![Star](https://img.shields.io/github/stars/milisp/mcp-linker?style=social)](https://github.com/milisp/mcp-linker/stargazers)
