# Contributing to mcp-linker 🎉

Thanks for your interest in improving mcp-linker! This guide explains how to set up your environment, make changes, and submit contributions.

## Development Setup

Prerequisites:
- Tauri v2 toolchain (see https://v2.tauri.app/start/prerequisites/)
- Bun package manager
- Rust toolchain (for the Tauri backend)

## Installation

### Clone and install dependencies:
```bash
git clone https://github.com/milisp/mcp-linker
cd mcp-linker
bun install
cp .env.example .env
```

### Install dependencies:
```sh
bun install
```

### Run the app in development:
```sh
bun tauri dev
```

### Build the frontend only:
```sh
bun run build
```

### Rust checks and formatting:
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

## Listing an MCP server

Add your server to the [directory](registry/README.md), which has the step-by-step
guide. This is what we check before merging. A server is listed when:

1. `bun run validate-registry` passes.
2. It works: the package installs, or the remote URL answers an MCP `initialize`
   (a `401` for an OAuth server is fine), and the config in the entry matches.
3. It is safe enough to list: no hard-coded secrets, no install step that runs
   unexplained scripts, and `fullDescription` states what access it needs, including
   tools that can run commands or write data.
4. The description says what the server does and which tools it offers, not just
   marketing copy.
5. It is one entry per product, with no duplicate of an existing server.
6. Its source is clear: `repository` points at the code that actually runs, so anyone
   can check it. Set `official: true` only if you publish the server for your own
   product; otherwise set `official: false`, which the app shows as "Community".
   Reviewers check the remote host, package scope or repository owner against the
   vendor before accepting `official: true`.
7. A package installed from git is pinned. An identifier such as `github:owner/repo`
   follows the default branch, so anyone who can push to it changes what users run.
   Use a tag or commit (`github:owner/repo#v1.2.0`), or publish to npm or PyPI.
   Pinning `npm` and `pypi` versions is recommended but not required.

Popularity, age and vendor status are not requirements. New servers start with few
stars, and the vendor is usually the best source for the right config, but anyone
may submit a server that meets the list above.

### Review timing

Listing is free. Pull requests are reviewed when a maintainer has time, there is no
deadline, and an open pull request is not a rejection. Pinging a maintainer on a pull request does
not change the order.

### Featured and sponsored placement

Listing is not an endorsement. Maintainers decide what appears in **Featured**
(`featured: true` and `registry/collections/`); a pull request cannot set that flag,
and being a sponsor does not guarantee it.

If you want a featured slot, a place in a collection, or a joint announcement, contact
the maintainer at [milisp@proton.me](mailto:milisp@proton.me) before opening a pull request.
Any paid or traded placement is labeled **Sponsored** in the app and the website and is
kept apart from entries chosen on merit.

## Listing a plugin

Add your plugin to the marketplace; [plugins/README.md](plugins/README.md#submitting-your-plugin)
has the entry format. This is what we check before merging. A plugin is listed when:

1. `bun run validate-plugins` passes and the entry points at a public GitHub repository,
   pinned to a full commit SHA.
2. It installs: `claude plugin validate .` passes in its repository, and
   `/plugin install <name>@mcp-linker` works.
3. It is safe enough to list: no hard-coded secrets, no hooks or scripts that run
   unexplained commands, and the README states what access its MCP servers, hooks and
   skills need, including anything that runs commands or writes data.
4. The description says what the plugin bundles and does, not just marketing copy.
5. It is one entry per plugin, with no duplicate of an existing one.
6. Its MCP servers are also listed in the [directory](registry/README.md) when they
   are published for others to use on their own.

Review timing and placement follow [the server rules](#review-timing): listing is free,
is not an endorsement, and **Featured** or sponsored placement is not set by a pull request.

## Reporting Bugs and Requesting Features

- Use GitHub Issues for bug reports and feature requests.
- Include steps to reproduce, expected vs. actual behavior, logs/screenshots, and environment details.

## Style and Conventions

- Language: English-only for code comments and documentation.
- UI: shadcn UI components with Tailwind CSS.
- State: Zustand with persistence.
- Keep changes minimal, focused, and consistent with the existing codebase.

## How to join
- Join our [Discord](https://discord.gg/zAjtD4kf5K) to chat!