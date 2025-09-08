# Contributing to mcp-linker 🎉

Thanks for your interest in improving mcp-linker! This guide explains how to set up your environment, make changes, and submit contributions.

## Development Setup

Prerequisites:
- Tauri v2 toolchain (see https://v2.tauri.app/start/prerequisites/)
- Bun package manager
- Rust toolchain (for the Tauri backend)

## Installation

Clone and install dependencies:
```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker/tauri-app
bun install
cp .env.example .env
```

Enter tauri-app folder:
```sh
cd tauri-app
```

### These command should use in tauri-app folder

Install dependencies:
```sh
bun install
```

Run the app in development:
```sh
bun tauri dev
```

Build the frontend only:
```sh
bun run build
```

Rust checks and formatting:
```sh
cd src-tauri && cargo check
cd src-tauri && cargo fmt --all
```

---

Optional: copy the pre-commit hook used in this repo to prevent common frontend issues.
```sh
cp docs/pre-commit .git/hooks/pre-commit
```

## Pull Request Process

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Make changes with clear, English-only code comments and docs.
4. Before pushing, verify builds pass:
   - `bun run build`
   - `cd src-tauri && cargo check`
5. Push your branch: `git push origin feature/amazing-feature`.
6. Open a Pull Request and describe your changes, rationale, and testing steps.

## Reporting Bugs and Requesting Features

- Use GitHub Issues for bug reports and feature requests.
- Include steps to reproduce, expected vs. actual behavior, logs/screenshots, and environment details.

## Style and Conventions

- Language: English-only for code comments and documentation.
- UI: shadcn UI components with Tailwind CSS.
- State: Zustand with persistence.
- Keep changes minimal, focused, and consistent with the existing codebase.

## How to join
- Join our [Discord](https://discord.gg/G9uJxjpd) to chat!