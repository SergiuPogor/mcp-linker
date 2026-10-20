#!/usr/bin/env node
"use strict";

// Runs the prebuilt mcpl binary from the platform package npm installed as
// an optional dependency (see npm/platforms/*).
const { spawnSync } = require("child_process");
const path = require("path");

const PLATFORM_PACKAGES = {
  "darwin-arm64": "@milisp/mcpl-darwin-arm64",
  "darwin-x64": "@milisp/mcpl-darwin-x64",
  "linux-x64": "@milisp/mcpl-linux-x64",
  "linux-arm64": "@milisp/mcpl-linux-arm64",
  "win32-x64": "@milisp/mcpl-win32-x64",
  "win32-arm64": "@milisp/mcpl-win32-arm64",
};

const key = `${process.platform}-${process.arch}`;
const pkg = PLATFORM_PACKAGES[key];
if (!pkg) {
  console.error(`[mcpl] unsupported platform: ${key}`);
  console.error("[mcpl] download a binary from https://github.com/milisp/mcp-linker/releases instead.");
  process.exit(1);
}

let bin;
try {
  const dir = path.dirname(require.resolve(`${pkg}/package.json`));
  bin = path.join(dir, process.platform === "win32" ? "mcpl.exe" : "mcpl");
} catch {
  console.error(
    `[mcpl] optional dependency ${pkg} is missing. npm skips it with --no-optional ` +
      "or an outdated lockfile. Try:\n  npm install -g @milisp/mcpl@latest --force"
  );
  process.exit(1);
}

const result = spawnSync(bin, process.argv.slice(2), { stdio: "inherit" });
if (result.error) {
  console.error(`[mcpl] failed to run ${bin}: ${result.error.message}`);
  process.exit(1);
}
if (result.signal) {
  process.kill(process.pid, result.signal);
}
process.exit(result.status === null ? 1 : result.status);
