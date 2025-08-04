# MCP Linker

## Tech Stack
- **Package Manager**: Bun (use `bun` instead of `npm` for all package management)
- **Framework**: Tauri v2 + React + Vite
- **Language**: TypeScript, Rust
- **UI**: Radix UI components + Tailwind CSS
- **Backend**: FastAPI (Python) in `mcp-linker-api/`
- **Database**: PostgreSQL with Prisma
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

## Project Structure
- `tauri-app/`: Main Tauri application (React frontend)
  - `src/`: React TypeScript source code
  - `src-tauri/`: Rust backend source code
- `mcp-linker-api/`: Python FastAPI backend
- `scripts/`: Build and release scripts

## Commands
- `bun install`: Install dependencies (DO NOT use npm install)
- `bun run dev`: Start development server
- `bun run build`: Build for production
- `bun run tauri dev`: Start Tauri development mode
- `bun run tauri build`: Build Tauri application

## Code Style
- Use TypeScript with strict mode
- React functional components with hooks
- Tailwind CSS for styling
- Follow existing component patterns in `src/components/`
- Use Zustand stores for state management
- Use TanStack Query for API calls

## Important Notes
- This project uses **Bun as the package manager** - always use `bun` commands instead of `npm`
- The project has both a React frontend (Tauri app) and Python FastAPI backend
- MCP (Model Context Protocol) server management is the core functionality
- Cross-platform desktop application (Windows, macOS, Linux)