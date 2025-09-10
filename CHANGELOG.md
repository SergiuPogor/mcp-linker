# Changelog

All notable changes to this project will be documented in this file.

## [1.7.1] - 2025-09-10

- Improved Update Experience
- Added in-app update check and automatic update functionality.
- New update dialog integrated into Settings and UpdateChecker components for a smoother user experience.
- Optimized GitHub Workflow
- Migrated to tauri-apps/tauri-action@v0 for more reliable CI/CD.
- Corrected workspace path and refined build setup for consistent cross-platform builds.
- Version & Dependency Updates
- Bumped project version to v1.7.1.
- Updated Tauri plugins, Radix UI, and other dependencies for improved performance and security.

## [1.7.0] - 2025-09-08

- add codex client - add, edit, delete local sync
- claude code - local sync, add mcp server from marketplace

## [1.6.0] - 2025-08-11

- add claude code client - add and delete mcp server
- add plux note and chat with mcp server system

## [1.5.3] - 2025-08-04

- Windows and Linux support for Cline and Roo clients
- Improved client configuration and path handling
- Enhanced cross-platform compatibility

## [1.3.2] - 2025-06-17

- Personal and Team Encrypted sync to cloud.
- Login require.

## [1.2.2] - 2025-05-04

chore: update dependencies and enhance UI components

- Upgraded @radix-ui/react-dialog from version 1.1.6 to 1.1.11 for improved functionality.
- Updated Node.js engine requirement from version 18 to 20 in package.json.
- Enhanced README with a new section inviting feedback for a Linux version.
- Refactored client selection logic in various components to improve clarity and maintainability.
- Improved UI consistency across components, including ServerCard and Sidebar.
- Added multi-language support for new UI elements and server management features.

## [1.2.1] - 2025-05-01

Fix: get server

## [1.2.0] - 2025-04-30

- Support Windows
- better ui
- Added new MIT License

## [1.1.0] - 2025-04-29

### Added
- Introduced a favorites feature for server management.
- Added recently used servers with persistent storage.
- Updated server configurations with support for both remote and local sources.

### Changed
- Enhanced UI components for better usability and structure.
- Updated styles and layout for improved user experience.

### Fixed
- Improved error handling in PowerShell commands.
- Fixed formatting of PATH environment variables in Windows setup.

### Documentation
- Added a requirements section to README.md for easier project setup instructions.

### Internal
- Removed the i18n module, refactored translation type definitions for better type safety.
- Updated dependencies:
- @rollup/rollup-win32-x64-msvc to 4.40.1
- @tauri-apps/cli to 2.5.0
- Bumped version to 1.1.0.

⸻

## [v1.0.0] - 2025-04-22

### Added
- Categories component with translation (i18n) support
- Server list component with search and dialog UI
- Reusable tabs component for consistent UI layout
- API function to fetch servers with fallback to local JSON
- Manager view for managing MCP server configurations
- Detail page for displaying selected category information