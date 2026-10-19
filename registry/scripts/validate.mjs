// Validates every catalog entry against the vendored MCP server.json schema
// and the catalog rules in README.md. Exits non-zero on any problem.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = new URL("..", import.meta.url).pathname;
const SCHEMA_URL = "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json";
const META_KEY = "io.github.milisp.mcp-linker";
const PUBLISHER_KEY = "io.modelcontextprotocol.registry/publisher-provided";
const ICON_BASE = "https://cdn.jsdelivr.net/gh/milisp/mcp-linker@main/registry/icons/";
const MAX_ICON_BYTES = 32 * 1024;
const UNSAFE_SVG = [
  [/<script\b/i, "<script>"],
  [/<foreignObject\b/i, "<foreignObject>"],
  [/<(image|use|feImage)\b[^>]*\bhref\s*=\s*["']?(?!#)/i, "an external reference"],
  [/\son[a-z]+\s*=/i, "an event handler attribute"],
  [/javascript:/i, "a javascript: URL"],
  [/url\(\s*["']?(?!#)/i, "an external url()"],
  [/<!ENTITY|<!DOCTYPE/i, "a DTD or entity"],
];

const readJson = path => JSON.parse(readFileSync(join(root, path), "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(readJson("schema/server.schema.json"));

const index = readJson("index.json");
const categories = new Set(index.categories);
const files = readdirSync(join(root, "servers")).filter(f => f.endsWith(".json"));
const icons = readdirSync(join(root, "icons")).filter(f => f.endsWith(".svg"));
const errors = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);

// index.json and servers/ must list exactly the same entries.
const listed = new Set(index.servers);
if (listed.size !== index.servers.length) fail("index.json", "servers contains duplicates");
for (const id of listed) {
  if (!files.includes(`${id}.json`)) fail("index.json", `"${id}" has no servers/${id}.json`);
}
for (const file of files) {
  if (!listed.has(file.slice(0, -5))) fail(`servers/${file}`, "not listed in index.json servers");
}

for (const file of files) {
  const where = `servers/${file}`;
  const id = file.slice(0, -5);
  let server;
  try {
    server = readJson(where);
  } catch (error) {
    fail(where, `invalid JSON (${error.message})`);
    continue;
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(where, "file name must be lowercase kebab-case");
  if (!validateSchema(server)) {
    for (const e of validateSchema.errors) fail(where, `${e.instancePath || "/"} ${e.message}`);
  }
  if (server.$schema !== SCHEMA_URL) fail(where, `$schema must be ${SCHEMA_URL}`);
  if (server.name?.split("/").pop() !== id) fail(where, `name must end with "/${id}"`);
  if (!server.packages?.length && !server.remotes?.length) {
    fail(where, "needs at least one entry in packages or remotes");
  }

  // Plain http is only acceptable for servers a local desktop app exposes.
  for (const remote of server.remotes ?? []) {
    const url = URL.parse(remote.url ?? "");
    const loopback = url && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url?.protocol !== "https:" && !(url?.protocol === "http:" && loopback)) {
      fail(where, `remote URL must use https (http only for loopback): ${remote.url}`);
    }
  }

  // Secrets are entered by the user at install time and never stored here.
  const inputs = [
    ...(server.packages ?? []).flatMap(p => p.environmentVariables ?? []),
    ...(server.remotes ?? []).flatMap(r => r.headers ?? []),
  ];
  for (const input of inputs) {
    if (input.isSecret && (input.value !== undefined || input.default !== undefined)) {
      fail(where, `secret input "${input.name}" must not have a value or default`);
    }
  }

  // Icons are hosted in this repository so clients never hotlink third parties.
  const iconSrc = `${ICON_BASE}${id}.svg`;
  if (server.icons?.length !== 1 || server.icons[0].src !== iconSrc) {
    fail(where, `icons must be [{ "src": "${iconSrc}", "mimeType": "image/svg+xml", "sizes": ["any"] }]`);
  }
  if (!icons.includes(`${id}.svg`)) fail(where, `missing icons/${id}.svg`);

  const meta = server._meta?.[PUBLISHER_KEY]?.[META_KEY];
  if (!meta) {
    fail(where, `missing _meta["${PUBLISHER_KEY}"]["${META_KEY}"]`);
  } else if (!categories.has(meta.category)) {
    fail(where, `category "${meta.category}" is not one of index.json categories`);
  }
}

// Collections group existing servers by use case, e.g. iOS development.
const collectionFiles = readdirSync(join(root, "collections")).filter(f => f.endsWith(".json"));
const listedCollections = new Set(index.collections ?? []);
if (listedCollections.size !== (index.collections ?? []).length) {
  fail("index.json", "collections contains duplicates");
}
for (const id of listedCollections) {
  if (!collectionFiles.includes(`${id}.json`)) fail("index.json", `"${id}" has no collections/${id}.json`);
}
for (const file of collectionFiles) {
  const where = `collections/${file}`;
  const id = file.slice(0, -5);
  if (!listedCollections.has(id)) fail(where, "not listed in index.json collections");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail(where, "file name must be lowercase kebab-case");
  let collection;
  try {
    collection = readJson(where);
  } catch (error) {
    fail(where, `invalid JSON (${error.message})`);
    continue;
  }
  const keys = Object.keys(collection).sort().join(",");
  if (keys !== "description,servers,title") fail(where, "must have exactly title, description, and servers");
  if (typeof collection.title !== "string" || !collection.title || collection.title.length > 40) {
    fail(where, "title must be 1-40 characters");
  }
  if (typeof collection.description !== "string" || collection.description.length > 200) {
    fail(where, "description must be a string of at most 200 characters");
  }
  const members = Array.isArray(collection.servers) ? collection.servers : [];
  if (members.length < 2) fail(where, "servers must list at least 2 servers");
  if (new Set(members).size !== members.length) fail(where, "servers contains duplicates");
  for (const member of members) {
    if (!listed.has(member)) fail(where, `"${member}" is not a server in index.json`);
  }
}

// SVGs can carry script, so only plain vector markup is accepted.
for (const file of icons) {
  const where = `icons/${file}`;
  if (!listed.has(file.slice(0, -4))) fail(where, "has no matching server");
  const svg = readFileSync(join(root, "icons", file), "utf8");
  if (Buffer.byteLength(svg) > MAX_ICON_BYTES) fail(where, `larger than ${MAX_ICON_BYTES / 1024} KB`);
  if (!/^\s*<svg\b[^>]*\bviewBox=/.test(svg)) fail(where, "must start with <svg> and have a viewBox");
  if (/<svg\b[^>]*\s(width|height)=/.test(svg)) fail(where, "root <svg> must not set width or height");
  for (const [pattern, label] of UNSAFE_SVG) {
    if (pattern.test(svg)) fail(where, `contains ${label}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s) found.`);
  process.exit(1);
}
console.log(`${files.length} servers OK.`);
