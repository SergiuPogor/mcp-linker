# MCP Client Configuration Paths

This document describes the supported MCP clients and their configuration file paths, categorized by platform and scope.

---

## Claude Code

- **Scope**: Project-level
- **Supported Platforms**: Cross-platform
- **Path**:
  ```
  <project_root>/.mcp.json
  ```

---

## Claude Desktop

- **Scope**: Global
- **Supported Platforms**:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `~/AppData/Roaming/Claude/claude_desktop_config.json`

---

## Cline

- **Scope**: Global
- **Supported Platforms**: macOS
- **Path**:
  ```
  ~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
  ```

---

## VS Code

- **Scope**: Project-level or fallback to Global if base path is empty
- **Supported Platforms**: Cross-platform
- **Paths**:
  - Project: `<base_path>/.vscode/mcp.json`
  - Global (fallback): `~/.vscode/mcp.json`

---

## Cursor

- **Scope**: Global or base path
- **Supported Platforms**: Cross-platform
- **Paths**:
  - Global: `~/.cursor/mcp.json`
  - With base path: `<base_path>/.cursor/mcp.json`

---

## MCPHub

- **Scope**: Global
- **Supported Platforms**: Cross-platform
- **Path**:
  ```
  ~/.config/mcphub/servers.json
  ```

---

## Windsurf

- **Scope**: Global
- **Supported Platforms**: Cross-platform
- **Path**:
  ```
  ~/.codeium/windsurf/mcp_config.json
  ```

---

## CherryStudio

- **Scope**: Global
- **Supported Platforms**: Cross-platform
- **Path**:
  ```
  ~/.config/cherrystudio/mcp.json
  ```
---

## Roo Code

- **Scope**: Project-level (preferred) or Global fallback (macOS only)
- **Supported Platforms**:
  - macOS (global fallback supported)
  - Cross-platform (project-based only)
- **Paths**:
  - Project: `<base_path>/.roo/mcp.json`
  - Global (macOS only):
    ```
    ~/Library/Application Support/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json
    ```

---

## Fallback

- **Scope**: Global or custom path
- **Supported Platforms**: Cross-platform
- **Path Resolution**:
  - If a file is specified: use directly
  - If a directory is specified: append `mcp.json`
  - If empty: use `~/mcp.json`