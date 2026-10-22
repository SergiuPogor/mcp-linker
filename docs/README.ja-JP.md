<div align="center">

<img src="../src-tauri/icons/128x128.png" alt="MCP Linker Logo" width="200" />

# MCP Linker

[![GitHub Release](https://img.shields.io/github/v/release/milisp/mcp-linker?color=2ea44f&logo=github)](https://github.com/milisp/mcp-linker/releases)
[![GitHub Stars](https://img.shields.io/github/stars/milisp/mcp-linker?color=yellow&logo=github)](https://github.com/milisp/mcp-linker/stargazers)
[![Downloads](https://img.shields.io/github/downloads/milisp/mcp-linker/total?color=blue)](https://github.com/milisp/mcp-linker/releases)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](../CONTRIBUTING.md)

[English](../README.md) · [简体中文](./README.zh-CN.md) · [繁體中文](./README.zh-TW.md) · **日本語** · [Deutsch](./README.de.md) · [Français](./README.fr.md) · [Español](./README.es.md)

**MCP サーバー、Skills、プラグインをワンクリックで追加し、AI クライアント間で同期 — LLM 呼び出し不要、マーケットプレイス内蔵**

[![Download](https://img.shields.io/badge/Download-macOS%20%C2%B7%20Windows%20%C2%B7%20Linux-2ea44f?style=for-the-badge&logo=github)](https://github.com/milisp/mcp-linker/releases/latest)

`brew install mcplinker` · [その他のインストール方法](#インストール)

</div>

> [!TIP]
> ⭐ リポジトリに Star を付けて、[Twitter](https://x.com/lisp_mi) と [GitHub](https://github.com/milisp) で **milisp** をフォローしてください！

![ローカル同期：Claude Code から Codex へサーバーをコピー](../images/sync-to-codex.webp)

## 🚀 なぜ MCP Linker？

- ⚡ **素早い** — MCP サーバー、Skills、プラグインを数秒で追加
- 🧠 **マルチクライアント対応** — 主要な AI クライアントすべてで利用可能

## ✨ 機能

- **ローカル同期** — 複数のクライアント間で MCP サーバー設定を同期
- **公式 MCP Registry** — registry.modelcontextprotocol.io からサーバーを直接検索してインストール
- **Skills** — 厳選カタログとコミュニティカタログ、任意の GitHub リポジトリからインストール可能、Claude Code と Codex でクライアントごとに有効化できます。構成は `npx skills` と同じです。[詳細を見る](./skills.md)
- **プラグイン** — Claude Code と Codex のプラグインマーケットプレイスを閲覧し、同期パネルで両者の間でプラグインをコピーできます。[詳細を見る](./plugins.md)
- **マルチクライアント対応** — Claude Desktop/Code、Codex、Cursor、VS Code、GitHub Copilot CLI、Cline、OpenCode、Pi、Hermes Agent。[詳細を見る](./clients.md)
- **クロスプラットフォーム** — macOS、Windows、Linux
- **スマート検出** — Python、Node.js、uv 環境を自動検出

## 🚀 クイックスタート

### インストール

**macOS (Homebrew)**
```bash
brew install mcplinker
```

**Arch Linux (AUR)**
```bash
yay -S mcp-linker-bin
```

**GitHub Releases（ビルド済みバイナリ）**
[ダウンロード](https://github.com/milisp/mcp-linker/releases)

> [!Note]
> サブスクリプションをご利用の場合は、初回ログイン後にアプリを再起動してください。

### 使い方

1. 内蔵マーケットプレイスで MCP サーバーを**探す**
2. **「Get」をクリック**して設定を表示
3. **「Add」をクリック**して選択したクライアントにインストール
4. **完了！** 新しい AI 機能をすぐに使えます

### CLI

`mcpl` を使えば、アプリなしでターミナルから同じ操作ができます：`npm install -g @milisp/mcpl`、
または `npx @milisp/mcpl` でお試しください。バイナリは [`mcpl-v*` リリース](https://github.com/milisp/mcp-linker/releases)にあります。

```bash
# Add one server to Claude Code, Codex and Cursor at once
mcpl add fs -c claude-code -c codex -c cursor -- npx -y @modelcontextprotocol/server-filesystem ~/work

mcpl ls                                  # every client on this machine
mcpl sync --from claude-code --to codex  # copy servers between clients (license)
mcpl skill install owner/repo            # install skills for Claude Code and Codex
mcpl plugin ls                           # plugins of Claude Code and Codex
```

すべてのコマンドは [cli.md](./cli.md) を参照してください。

## スクリーンショット

| プロジェクト間のローカル同期 | サーバー探索 | 管理 |
|-----------------------------|------------------|--------|
| ![Claude Code プロジェクト間のローカル同期](../images/sync-projects.webp) | ![探索](../images/discover.webp) | ![管理](../images/manage.webp) |

## MCP とは？
Model Context Protocol は AI にとっての USB-C のようなもので、AI モデルをさまざまなデータソースやツールに接続するための標準的な方法です。

## 🤝 MCP サーバーを追加する

MCP サーバーを作った、または自社プロダクトで運用している方は、**ぜひディレクトリに登録してください。** 動作し安全なサーバーであれば、できたばかりでも歓迎します。JSON ファイルを 1 つ追加するプルリクエストを送るだけです：[サーバーの追加方法](../registry/README.md#adding-a-server)と[掲載基準](../CONTRIBUTING.md#listing-an-mcp-server)をご覧ください。

Claude Code プラグイン（MCP サーバー + Skills）を作りましたか？**こちらも登録できます**：プラグインマーケットプレイスに、あなたのリポジトリを指すエントリを 1 つ追加します。[プラグインの登録方法](../plugins/README.md#submitting-your-plugin)をご覧ください。

Skill（`SKILL.md`）をお持ちですか？**Skills ページに登録しましょう**：[`skills/catalog.json`](../skills/catalog.json) にエントリを 1 つ追加します。[skills.md](./skills.md) を参照してください。

## 🧭 関連プロジェクト

- [milisp/codexia](http://github.com/milisp/codexia) - Codex と Claude Code のためのエージェントワークステーション。
- [**awesome-claude-dxt**](https://github.com/milisp/awesome-claude-dxt) — Claude Desktop 拡張機能（dxt）、ツール、リソースの厳選リスト
- [**awesome-codex-cli**](https://github.com/milisp/awesome-codex-cli) — Codex のツール、プラグイン、Skills、MCP の厳選リスト

## 💬 コミュニティとサポート

- [💬 Discord に参加](https://discord.gg/zAjtD4kf5K)
- [💬 ディスカッションに参加](https://github.com/milisp/mcp-linker/discussions)
- [🐛 問題を報告](https://github.com/milisp/mcp-linker/issues)

## 🛠️ 開発

開発用コマンドとコントリビューションのガイドは [CONTRIBUTING](../CONTRIBUTING.md) をご覧ください

## 🔍 トラブルシューティング

[Wiki](https://github.com/milisp/mcp-linker/wiki) をご覧ください

## 💖 コントリビューター

すべての素晴らしいコントリビューターの皆さまに感謝します！

<a href="https://github.com/milisp/mcp-linker/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=milisp/mcp-linker" />
</a>

## ライセンス

MCP Linker は **AGPL-3.0** と**商用ライセンス**のデュアルライセンスです。

- **AGPL-3.0** — オープンソースでの利用向け。
- **商用ライセンス** — クローズドソース、プロプライエタリ、ホスティング、SaaS での利用には必須です。

---
**お役に立ちましたか？プロジェクトに ⭐ をお願いします！**

## 📈 Star 履歴

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)
