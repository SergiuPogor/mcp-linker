// Validates skills/catalog.json, the list behind the app's Skills page. Exits non-zero on any problem.
// Curated entries (curated: true) are maintained by MCP Linker and may follow a branch; community
// entries must pin a full commit, since a branch can change under users.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const file = "skills/catalog.json";
const skills = JSON.parse(readFileSync(join(root, file), "utf8")).skills ?? [];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

const seen = new Set();
for (const skill of skills) {
  const where = `${file} "${skill.name}"`;
  if (!KEBAB.test(skill.name ?? "")) fail(where, "name must be lowercase kebab-case");
  if (seen.has(skill.name)) fail(where, "duplicate name");
  seen.add(skill.name);
  if (!skill.description || skill.description.length > 500) fail(where, "description is required and at most 500 characters");
  if (!/^[\w.-]+\/[\w.-]+$/.test(skill.repo ?? "")) fail(where, "repo must be a GitHub owner/repo");
  if (skill.path !== undefined && (typeof skill.path !== "string" || skill.path.startsWith("/") || skill.path.split("/").includes(".."))) {
    fail(where, "path must be a relative folder inside the repo");
  }
  if (!skill.path) fail(where, "path (the folder holding SKILL.md) is required");
  if (skill.sha !== undefined && !/^[0-9a-f]{40}$/.test(skill.sha)) fail(where, "sha must be a full 40-character commit");
  if (!skill.curated && !skill.sha) fail(where, "community entries must pin sha to a full 40-character commit (a branch can change under users)");
  if (!skill.curated && skill.homepage === undefined) fail(where, "set homepage so reviewers and users can inspect the code");
}

if (errors.length) {
  console.error(errors.map(e => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${skills.length} skill(s) valid (${skills.filter(s => s.curated).length} curated, ${skills.filter(s => !s.curated).length} community)`);
