import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "path";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

/** When each catalog server was first committed, by id. Empty in a shallow clone, where every file would look new. */
function catalogAddedDates(): Record<string, string> {
  const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  try {
    if (git("rev-parse", "--is-shallow-repository") === "true") return {};
    const dates: Record<string, string> = {};
    for (const file of readdirSync("registry/servers")) {
      const added = git("log", "--follow", "--diff-filter=A", "--format=%as", "--", `registry/servers/${file}`).split("\n").pop();
      if (added) dates[file.replace(/\.json$/, "")] = added;
    }
    return dates;
  } catch {
    return {};
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  define: { __CATALOG_ADDED__: JSON.stringify(catalogAddedDates()) },
  plugins: [react(), tailwindcss(), svgr()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react")) {
            return "react-core";
          }
          if (id.includes("zustand")) {
            return "zustand";
          }
          if (id.includes("@tanstack")) {
            return "react-query";
          }
          return undefined;
        },
      },
    },
    target: "esnext",
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
  },
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**", "**/dist/**", "**/docs/**", "**/README.md"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
