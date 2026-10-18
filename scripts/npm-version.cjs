#!/usr/bin/env node
// Sets every mcpl npm package (npm/mcpl and npm/platforms/*) and the main
// package's optionalDependencies to one version.
//   node scripts/npm-version.cjs 0.2.0
"use strict";

const fs = require("fs");
const path = require("path");

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version ?? "")) {
  console.error("usage: node scripts/npm-version.cjs <X.Y.Z>");
  process.exit(1);
}

const root = path.join(__dirname, "..", "npm");
const platforms = path.join(root, "platforms");
const files = [
  path.join(root, "mcpl", "package.json"),
  ...fs.readdirSync(platforms).map(dir => path.join(platforms, dir, "package.json")),
];
for (const file of files) {
  const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
  pkg.version = version;
  for (const dep of Object.keys(pkg.optionalDependencies ?? {})) pkg.optionalDependencies[dep] = version;
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + "\n");
}
console.log(`npm packages set to ${version}`);
