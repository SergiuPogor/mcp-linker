<div align="center">

<img src="../src-tauri/icons/128x128.png" alt="MCP Linker Logo" width="200" />

# MCP Linker

[![GitHub Release](https://img.shields.io/github/v/release/milisp/mcp-linker?color=2ea44f&logo=github)](https://github.com/milisp/mcp-linker/releases)
[![GitHub Stars](https://img.shields.io/github/stars/milisp/mcp-linker?color=yellow&logo=github)](https://github.com/milisp/mcp-linker/stargazers)
[![Downloads](https://img.shields.io/github/downloads/milisp/mcp-linker/total?color=blue)](https://github.com/milisp/mcp-linker/releases)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../CONTRIBUTING.md)

[English](../README.md) · [简体中文](./README.zh-CN.md) · [繁體中文](./README.zh-TW.md) · [日本語](./README.ja-JP.md) · [Deutsch](./README.de.md) · [Français](./README.fr.md) · **Español**

**Añade y sincroniza con un clic servidores MCP, skills y plugins entre clientes de IA — sin llamadas a LLM, con marketplace integrado**

[![Download](https://img.shields.io/badge/Download-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-2ea44f?style=for-the-badge&logo=github)](https://github.com/milisp/mcp-linker/releases/latest)

`brew install mcplinker` · [Más opciones de instalación](#instalación)

</div>

> [!TIP]
> ⭐ Dale una estrella al repositorio y sigue a **milisp** en [Twitter](https://x.com/lisp_mi) y [GitHub](https://github.com/milisp) para enterarte de más.

![Sincronización local: copiar servidores de Claude Code a Codex](../images/sync-to-codex.webp)

## 🚀 ¿Por qué MCP Linker?

- ⚡ **Instantáneo** — Añade servidores MCP, skills y plugins en segundos
- 🧠 **Compatible con varios clientes** — Funciona con los principales clientes de IA

## ✨ Características

- **Sincronización local** — Sincroniza las configuraciones de servidores MCP entre varios clientes
- **Registro MCP oficial** — Explora e instala servidores directamente desde registry.modelcontextprotocol.io
- **Skills** — Catálogo seleccionado y catálogo de la comunidad, instalación desde cualquier repositorio de GitHub y activación por cliente para Claude Code y Codex. Misma estructura que `npx skills`. [Ver detalle](./skills.md)
- **Plugins** — Explora los marketplaces de plugins de Claude Code y Codex, y copia plugins entre ambos desde un panel de sincronización. [Ver detalle](./plugins.md)
- **Compatible con varios clientes** — Claude Desktop/Code, Codex, Cursor, VS Code, GitHub Copilot CLI, Cline, OpenCode, Pi, Hermes Agent. [Ver detalle](./clients.md)
- **Multiplataforma** — macOS, Windows, Linux
- **Detección inteligente** — Detecta automáticamente entornos de Python, Node.js y uv

## 🚀 Inicio rápido

### Instalación

**macOS (Homebrew)**
```bash
brew install mcplinker
```

**Arch Linux (AUR)**
```bash
yay -S mcp-linker-bin
```

**GitHub Releases (binarios precompilados)**
[Descargar](https://github.com/milisp/mcp-linker/releases)

> [!Note]
> Si te has suscrito, vuelve a abrir la aplicación después de iniciar sesión por primera vez.

### Primeros pasos

1. **Explora** los servidores MCP en el marketplace integrado
2. **Haz clic en «Get»** para ver la configuración
3. **Haz clic en «Add»** para instalarlo en el cliente que elijas
4. **¡Listo!** Empieza a usar nuevas capacidades de IA de inmediato

### CLI

`mcpl` hace lo mismo desde la terminal, sin necesidad de la aplicación: `npm install -g @milisp/mcpl`,
o `npx @milisp/mcpl` para probarlo. Los binarios están en las [versiones `mcpl-v*`](https://github.com/milisp/mcp-linker/releases).

```bash
# Add one server to Claude Code, Codex and Cursor at once
mcpl add fs -c claude-code -c codex -c cursor -- npx -y @modelcontextprotocol/server-filesystem ~/work

mcpl ls                                  # every client on this machine
mcpl sync --from claude-code --to codex  # copy servers between clients (license)
mcpl skill install owner/repo            # install skills for Claude Code and Codex
mcpl plugin ls                           # plugins of Claude Code and Codex
```

Consulta [cli.md](./cli.md) para ver todos los comandos.

## Capturas de pantalla

| Sincronización local entre proyectos | Descubrimiento de servidores | Gestión |
|-----------------------------|------------------|--------|
| ![Sincronización local entre proyectos de Claude Code](../images/sync-projects.webp) | ![Descubrir](../images/discover.webp) | ![Gestionar](../images/manage.webp) |

## ¿Qué es MCP?
El Model Context Protocol es como el USB-C de la IA: una forma estándar de conectar modelos de IA con distintas fuentes de datos y herramientas.

## 🤝 Añade tu servidor MCP

¿Has creado un servidor MCP, o gestionas uno para tu producto? **Envíalo al directorio.** Cualquier servidor que funcione y sea seguro es bienvenido, por nuevo que sea. Abre un pull request que añada un archivo JSON: consulta [cómo añadir un servidor](../registry/README.md#adding-a-server) y los [criterios de inclusión](../CONTRIBUTING.md#listing-an-mcp-server).

¿Has creado un plugin de Claude Code (servidores MCP + skills)? **Inclúyelo también**: una entrada en el marketplace de plugins que apunte a tu repositorio. Consulta [cómo enviar tu plugin](../plugins/README.md#submitting-your-plugin).

¿Tienes un skill (`SKILL.md`)? **Inclúyelo en la página de Skills**: una entrada en [`skills/catalog.json`](../skills/catalog.json). Consulta [skills.md](./skills.md).

## 🧭 Proyectos relacionados

- [milisp/codexia](http://github.com/milisp/codexia) - Estación de trabajo de agentes para Codex y Claude Code.
- [**awesome-claude-dxt**](https://github.com/milisp/awesome-claude-dxt) — una lista seleccionada de extensiones de Claude Desktop (dxt), herramientas y recursos
- [**awesome-codex-cli**](https://github.com/milisp/awesome-codex-cli) — lista seleccionada de herramientas, plugins, skills y MCP para Codex

## 💬 Comunidad y soporte

- [💬 Únete a Discord](https://discord.gg/zAjtD4kf5K)
- [💬 Únete a las discusiones](https://github.com/milisp/mcp-linker/discussions)
- [🐛 Reporta problemas](https://github.com/milisp/mcp-linker/issues)

## 🛠️ Desarrollo

Para los comandos de desarrollo y la guía de contribución, consulta [CONTRIBUTING](../CONTRIBUTING.md)

## 🔍 Solución de problemas

Consulta la [Wiki](https://github.com/milisp/mcp-linker/wiki)

## 💖 Colaboradores

¡Gracias a todos nuestros magníficos colaboradores!

<a href="https://github.com/milisp/mcp-linker/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=milisp/mcp-linker" />
</a>

## Licencia

MCP Linker tiene doble licencia: **AGPL-3.0** y **licencia comercial**.

- **AGPL-3.0** — para uso de código abierto.
- **Licencia comercial** — necesaria para uso de código cerrado, propietario, alojado o SaaS.

---
**¿Te ha resultado útil? ¡Dale una ⭐ al proyecto!**

## 📈 Historial de estrellas

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)
