<p align="center">
  <img src="../public/logo.png" alt="Project Logo" width="200" />
</p>

<p align="center">
  📘 言語を選択：
  <a href="../README.md">English</a> |
  <a href="./README.zh-CN.md">简体中文</a> |
  <strong>日本語</strong>
</p>

<p align="center">
  <a href="https://github.com/milisp/mcp-linker/stargazers">
    ⭐ このプロジェクトが役に立った場合は、ぜひスターを付けてください！
  </a>
  <br/>
  <a href="https://github.com/milisp/mcp-linker">
    <img src="https://img.shields.io/github/stars/milisp/mcp-linker?style=social" alt="GitHub stars"/>
    <img src="https://img.shields.io/github/forks/milisp/mcp-linker?style=social" alt="GitHub forks"/>
  </a>
</p>

# MCP Linker

> **Model Context Protocol (MCP) サーバー** を MCP クライアント（**Claude Cursor windsurf...**）に簡単に追加できます。操作は2クリックだけ：**取得** と **追加**。macos win をサポート

## 🔽 MCP Linkerをダウンロード

👉 [🐙Gumroadでダウンロード](https://wei40680.gumroad.com/l/jdbuvc?wanted=true)
👉 [GitHubリリースでダウンロード](https://github.com/milisp/mcp-linker/releases)

## ✨ 特徴

✅ ワンクリックで MCP サーバーを追加  
✅ 複数の MCP サーバー構成をサポート  
✅ オープンソースでコミュニティ主導  
✅ お気に入り：サーバーをお気に入りとしてマークし、すばやくアクセス可能  
✅ 最近使用したもの：最近追加したサーバーを自動的に保存して表示  
✅ Windows対応：Windowsでも動作（実験的）  
✅ エラー処理とインストールガイドを改善  

🗨 [フィードバックまたは質問](https://github.com/milisp/mcp-linker/discussions)

## 🔧 必要な環境

このプロジェクトを実行するには、以下のツールがインストールされていることを確認してください：

- Node.js
- bun（または pnpm）
- Rust ツールチェーン（安定版、Tauri 用）

## インストール

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

> **注意：** 問題が発生した場合は、`package-lock.json` ファイルと `node_modules` ディレクトリを削除してから、次のコマンドを実行してください：
> ```bash
> npm install --legacy-peer-deps
> ```

## 🚀 クイックスタート

1. **ブラウズ＆選択**：利用可能なリストから MCP サーバーを選択します。  
2. **インストール**：**「取得」** をクリックしてサーバーの構成を表示します。  
3. **アクティベート**：**「追加」** をクリックして MCP クライアントに統合します。  

> **ヒント：** お気に入りや最近使用したサーバーは、利便性のためローカルに保存されます！

## 🌐 公式サーバー

[公式 MCP サーバーのリスト](https://github.com/modelcontextprotocol/servers)をチェックしてください。

## 🖼️ スクリーンショット

### サーバーの発見
![発見スクリーンショット](../images/home.png)

### 構成例
![構成スクリーンショット](../images/config.png)

### 管理例
![管理スクリーンショット](../images/manager.png)

---

## 🤝 コントリビュート

コントリビュートを歓迎します！以下の手順で貢献できます：

1. **このリポジトリをフォーク＆クローン** します。
2. **プルリクエストを送信** して変更を提出します。

## 🎉 貢献者

このプロジェクトを改善してくれた貢献者の皆様、ありがとうございます：

- [@eltociear](https://github.com/eltociear) — 日本語翻訳
- [@devilcoder01](https://github.com/devilcoder01) — Windows ビルドの互換性とプロジェクトセットアップ手順の改善

---

[![Star History Chart](https://api.star-history.com/svg?repos=milisp/mcp-linker&type=Date)](https://star-history.com/#milisp/mcp-linker)