# MCP server directory

The open MCP server directory used by the [MCP Linker](https://github.com/milisp/mcp-linker)
desktop app and website. Each server is one JSON file in the official MCP Registry
[`server.json`](https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json)
format, plus one SVG icon.

Anyone can submit a server. A listing means the entry is valid, works, and has no
obvious safety problem. It is **not** an endorsement. See [CONTRIBUTING.md](../CONTRIBUTING.md)
for the exact criteria.

Two layers:

- **Directory**: every entry in `index.json`, grouped by category.
- **Featured**: entries with `featured: true`, plus the hand-picked `collections/`.
  Maintainers choose these. Popularity, official vendor status and quality of
  maintenance all count, and submitting a PR does not put a server here.

## Layout

```
index.json             display order, categories, and collections
servers/<id>.json      one server, server.json format
icons/<id>.svg         its icon
collections/<id>.json  a themed set of servers
schema/                vendored server.json schema (2025-12-11)
scripts/validate.mjs
```

## Adding a server

1. Pick an `<id>`: lowercase kebab-case, e.g. `my-service`.
2. Create `servers/<id>.json`. Copy an existing entry with the same transport:
   `notion.json` for a remote server, `clickup.json` for an npm package.
   - `name` is `io.github.milisp.mcp-linker/<id>`.
   - `description` is at most 100 characters. Longer text goes in `fullDescription`.
   - Set `official` in the catalog metadata: `true` only if you publish this server for
     your own product, otherwise `false` (see [Official and Community](#official-and-community)).
   - Declare user-supplied values as `environmentVariables` or headers with
     `isSecret: true`. **Never commit a real token.**
   - Remote URLs must use `https`. Plain `http` is only accepted for loopback
     servers exposed by a local desktop app.
3. Add `icons/<id>.svg` and set `icons` to
   `[{ "src": "https://cdn.jsdelivr.net/gh/milisp/mcp-linker@main/registry/icons/<id>.svg", "mimeType": "image/svg+xml", "sizes": ["any"] }]`.
4. Add `<id>` to `servers` in `index.json`. Array order is display order, so append to the end.
5. Run `bun install && bun run validate-registry`, then open a pull request.

You don't need to clone anything: on GitHub, open `registry/servers/`, choose
**Add file → Create new file**, and GitHub forks the repository and opens the
pull request for you.

### Catalog metadata

MCP Linker reads its own fields from
`_meta["io.modelcontextprotocol.registry/publisher-provided"]["io.github.milisp.mcp-linker"]`:

| Field | Required | Meaning |
|---|---|---|
| `category` | yes | One of `index.json` `categories` |
| `configName` | no | Key written into client configuration files |
| `official` | yes | `true` if the product's own vendor publishes this server, `false` for a community server |
| `featured` | no | `true` shows the server in the Featured section. Maintainers only |
| `fullDescription` | no | Details beyond the 100-character `description` |

### Official and Community

The app and the website show a badge for every server: **Official** when `official` is
`true`, **Community** when it is `false`. Cards only mark Official servers.

The flag is written by the submitter, so the script cannot check it. Reviewers do:
for `official: true` they compare the remote host, the package scope or the repository
owner with the vendor of the product. If they cannot confirm it, they ask you to
change it to `false`, and the server is still listed. Setting it to `true` for a
product you do not publish gets the entry rejected.

### After your server is listed

Your server gets a page at `https://mcp-linker.milisp.dev/servers/<id>` with one-click
setup for every supported client. You can link to it from your own README with a badge;
the page also shows this snippet ready to copy:

```markdown
[![Add to MCP Linker](https://mcp-linker.milisp.dev/badge.svg)](https://mcp-linker.milisp.dev/servers/<id>)
```

This is optional and does not affect whether a server is listed.

These are local definitions, not claims of official registry publication or
ownership of the publisher's namespace. `version: "1.0.0"` versions the directory
entry, not the upstream software.

Discover displays featured entries first, then the rest of the directory grouped by
category, followed by additional Registry results. Search and transport filters
apply to all sections.
