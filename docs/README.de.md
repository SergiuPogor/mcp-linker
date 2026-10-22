<div align="center">

<img src="../src-tauri/icons/128x128.png" alt="MCP Linker Logo" width="200" />

# MCP Linker

[![GitHub Release](https://img.shields.io/github/v/release/milisp/mcp-linker?color=2ea44f&logo=github)](https://github.com/milisp/mcp-linker/releases)
[![GitHub Stars](https://img.shields.io/github/stars/milisp/mcp-linker?color=yellow&logo=github)](https://github.com/milisp/mcp-linker/stargazers)
[![Downloads](https://img.shields.io/github/downloads/milisp/mcp-linker/total?color=blue)](https://github.com/milisp/mcp-linker/releases)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../CONTRIBUTING.md)

[English](../README.md) · [简体中文](./README.zh-CN.md) · [繁體中文](./README.zh-TW.md) · [日本語](./README.ja-JP.md) · **Deutsch** · [Français](./README.fr.md) · [Español](./README.es.md)

**MCP-Server, Skills und Plugins mit einem Klick hinzufügen und zwischen KI-Clients synchronisieren — keine LLM-Aufrufe nötig, integrierter Marktplatz**

[![Download](https://img.shields.io/badge/Download-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-2ea44f?style=for-the-badge&logo=github)](https://github.com/milisp/mcp-linker/releases/latest)

`brew install mcplinker` · [Weitere Installationsoptionen](#installation)

</div>

> [!TIP]
> ⭐ Gib dem Repo einen Stern und folge **milisp** auf [Twitter](https://x.com/lisp_mi) und [GitHub](https://github.com/milisp), um mehr zu erfahren!

![Lokale Synchronisierung: Server von Claude Code nach Codex kopieren](../images/sync-to-codex.webp)

## 🚀 Warum MCP Linker?

- ⚡ **Sofort** — MCP-Server, Skills und Plugins in Sekunden hinzufügen
- 🧠 **Multi-Client-Unterstützung** — funktioniert mit allen gängigen KI-Clients

## ✨ Funktionen

- **Lokale Synchronisierung** — MCP-Server-Konfigurationen über mehrere Clients hinweg synchronisieren
- **Offizielle MCP Registry** — Server direkt über registry.modelcontextprotocol.io durchsuchen und installieren
- **Skills** — kuratierter Katalog und Community-Katalog, Installation aus jedem GitHub-Repo, pro Client für Claude Code und Codex aktivierbar. Gleiche Struktur wie `npx skills`. [Details ansehen](./skills.md)
- **Plugins** — Plugin-Marktplätze von Claude Code und Codex durchsuchen und Plugins in einem Sync-Panel zwischen beiden kopieren. [Details ansehen](./plugins.md)
- **Multi-Client-Unterstützung** — Claude Desktop/Code, Codex, Cursor, VS Code, GitHub Copilot CLI, Cline, OpenCode, Pi, Hermes Agent. [Details ansehen](./clients.md)
- **Plattformübergreifend** — macOS, Windows, Linux
- **Intelligente Erkennung** — erkennt Python-, Node.js- und uv-Umgebungen automatisch

## 🚀 Schnellstart

### Installation

**macOS (Homebrew)**
```bash
brew install mcplinker
```

**Arch Linux (AUR)**
```bash
yay -S mcp-linker-bin
```

**GitHub Releases (vorkompilierte Binärdateien)**
[Herunterladen](https://github.com/milisp/mcp-linker/releases)

> [!Note]
> Wenn du ein Abonnement abgeschlossen hast, starte die App nach der ersten Anmeldung neu.

### Erste Schritte

1. Im integrierten Marktplatz MCP-Server **durchsuchen**
2. **„Get" anklicken**, um die Konfiguration anzuzeigen
3. **„Add" anklicken**, um sie im gewählten Client zu installieren
4. **Fertig!** Neue KI-Fähigkeiten sofort nutzen

### CLI

`mcpl` erledigt dasselbe im Terminal, ganz ohne App: `npm install -g @milisp/mcpl`,
oder `npx @milisp/mcpl` zum Ausprobieren. Binärdateien findest du in den [`mcpl-v*`-Releases](https://github.com/milisp/mcp-linker/releases).

```bash
# Add one server to Claude Code, Codex and Cursor at once
mcpl add fs -c claude-code -c codex -c cursor -- npx -y @modelcontextprotocol/server-filesystem ~/work

mcpl ls                                  # every client on this machine
mcpl sync --from claude-code --to codex  # copy servers between clients (license)
mcpl skill install owner/repo            # install skills for Claude Code and Codex
mcpl plugin ls                           # plugins of Claude Code and Codex
```

Alle Befehle findest du in [cli.md](./cli.md).

## Screenshots

| Lokale Synchronisierung zwischen Projekten | Server-Entdeckung | Verwalten |
|-----------------------------|------------------|--------|
| ![Lokale Synchronisierung zwischen Claude-Code-Projekten](../images/sync-projects.webp) | ![Entdecken](../images/discover.webp) | ![Verwalten](../images/manage.webp) |

## Was ist MCP?
Das Model Context Protocol ist wie USB-C für KI — ein Standard, um KI-Modelle mit verschiedenen Datenquellen und Tools zu verbinden.

## 🤝 Deinen MCP-Server hinzufügen

Du hast einen MCP-Server gebaut oder betreibst einen für dein Produkt? **Reiche ihn im Verzeichnis ein.** Jeder funktionierende, sichere Server ist willkommen, egal wie neu er ist. Öffne einen Pull Request, der eine JSON-Datei hinzufügt: siehe [So fügst du einen Server hinzu](../registry/README.md#adding-a-server) und die [Aufnahmekriterien](../CONTRIBUTING.md#listing-an-mcp-server).

Du hast ein Claude-Code-Plugin (MCP-Server + Skills) gebaut? **Trag es ebenfalls ein**: ein Eintrag im Plugin-Marktplatz, der auf dein Repo verweist. Siehe [Plugin einreichen](../plugins/README.md#submitting-your-plugin).

Du hast einen Skill (`SKILL.md`)? **Liste ihn auf der Skills-Seite**: ein Eintrag in [`skills/catalog.json`](../skills/catalog.json). Siehe [skills.md](./skills.md).

## 🧭 Verwandte Projekte

- [milisp/codexia](http://github.com/milisp/codexia) - Agent-Workstation für Codex und Claude Code.
- [**awesome-claude-dxt**](https://github.com/milisp/awesome-claude-dxt) — eine kuratierte Liste von Claude-Desktop-Erweiterungen (dxt), Tools und Ressourcen
- [**awesome-codex-cli**](https://github.com/milisp/awesome-codex-cli) — kuratierte Liste von Codex-Tools, Plugins, Skills und MCPs

## 💬 Community & Support

- [💬 Discord beitreten](https://discord.gg/zAjtD4kf5K)
- [💬 Diskussionen beitreten](https://github.com/milisp/mcp-linker/discussions)
- [🐛 Probleme melden](https://github.com/milisp/mcp-linker/issues)

## 🛠️ Entwicklung

Entwicklungsbefehle und Hinweise zum Mitwirken findest du in [CONTRIBUTING](../CONTRIBUTING.md)

## 🔍 Fehlerbehebung

Siehe das [Wiki](https://github.com/milisp/mcp-linker/wiki)

## 💖 Mitwirkende

Danke an alle großartigen Mitwirkenden!

<a href="https://github.com/milisp/mcp-linker/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=milisp/mcp-linker" />
</a>

## Lizenz

MCP Linker ist unter **AGPL-3.0** und einer **kommerziellen Lizenz** doppelt lizenziert.

- **AGPL-3.0** — für die Nutzung in Open-Source-Projekten.
- **Kommerzielle Lizenz** — erforderlich für Closed-Source-, proprietäre, gehostete oder SaaS-Nutzung.

---
**Hilfreich? Gib dem Projekt bitte einen ⭐!**

## 📈 Star-Verlauf

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)
