// Validates the plugin marketplaces at the repo root. Exits non-zero on any problem.
// Local packs (plugins/<name>) must be listed in both marketplaces; community
// plugins are external GitHub sources, pinned to a commit, in the Claude Code one.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const readJson = path => JSON.parse(readFileSync(join(root, path), "utf8"));
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

const claudeFile = ".claude-plugin/marketplace.json";
const codexFile = ".agents/plugins/marketplace.json";
const claude = readJson(claudeFile).plugins ?? [];
const codex = new Set((readJson(codexFile).plugins ?? []).map(p => p.name));

const seen = new Set();
const localNames = new Set();
for (const plugin of claude) {
  const where = `${claudeFile} "${plugin.name}"`;
  if (!KEBAB.test(plugin.name ?? "")) fail(where, "name must be lowercase kebab-case");
  if (seen.has(plugin.name)) fail(where, "duplicate name");
  seen.add(plugin.name);
  if (!plugin.description || plugin.description.length > 300) {
    fail(where, "description is required and at most 300 characters");
  }

  const { source } = plugin;
  if (typeof source === "string") {
    localNames.add(plugin.name);
    if (source !== `./plugins/${plugin.name}`) fail(where, `local source must be ./plugins/${plugin.name}`);
    for (const file of [".claude-plugin/plugin.json", ".codex-plugin/plugin.json"]) {
      const path = `plugins/${plugin.name}/${file}`;
      if (!existsSync(join(root, path))) fail(where, `missing ${path}`);
      else if (readJson(path).name !== plugin.name) fail(path, `name must be "${plugin.name}"`);
    }
  } else if (source?.source === "github") {
    if (!/^[\w.-]+\/[\w.-]+$/.test(source.repo ?? "")) fail(where, "source.repo must be owner/repo");
    if (!/^[0-9a-f]{40}$/.test(source.sha ?? "")) {
      fail(where, "source.sha must pin a full 40-character commit (a branch or tag can change under users)");
    }
    if (plugin.homepage === undefined && plugin.repository === undefined) {
      fail(where, "set homepage or repository so reviewers and users can inspect the code");
    }
  } else {
    fail(where, 'source must be a "./plugins/<name>" path or { "source": "github", "repo", "sha" }');
  }
}

for (const name of localNames) {
  if (!codex.has(name)) fail(codexFile, `local pack "${name}" is missing`);
}
for (const name of codex) {
  if (!localNames.has(name)) fail(codexFile, `"${name}" is not a local pack; Codex entries are maintainer-added`);
}

if (errors.length) {
  console.error(errors.map(e => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${claude.length} plugin(s) valid (${localNames.size} local, ${claude.length - localNames.size} community)`);
