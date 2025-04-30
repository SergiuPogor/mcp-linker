# Changelog

All notable changes to this project will be documented in this file.

### [1.1.0] - 2025-04-29

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