# Skills

A skill is a folder with a `SKILL.md` (name and description in front matter, instructions
below) plus any files it refers to. Claude Code reads `~/.claude/skills/<name>`, Codex reads
`~/.codex/skills/<name>`. MCP Linker's **Skills** page installs, shares and shows them. The code
is `mcpl_core::skills`; it needs no Node or npm, only `git` for remote sources.

## Same layout as `npx skills`

MCP Linker uses the files that [`npx skills`](https://github.com/vercel-labs/skills) uses, so the
two tools see and update the same skills:

- `~/.agents/skills/<name>`: the one real copy.
- `~/.agents/.skill-lock.json`: where each came from (`source`, `sourceUrl`, `ref`, `skillFolderHash`, …).
- `~/.claude/skills/<name>` and `~/.codex/skills/<name>`: symlinks to the real copy. A client "has"
  a skill when its link exists.

A skill you wrote straight into `~/.claude/skills` shows up too; the first time you link or unlink it,
it is moved to `~/.agents/skills` and linked back, so nothing is lost.

## In the app

- **Installed**: toggle a skill per client, open it to read its rendered `SKILL.md` and file list,
  check for updates, uninstall. Tick several rows for batch actions: add to Claude Code or Codex
  (this is how you sync the two), update, uninstall.
- **Curated** and **Community**: the list in [`skills/catalog.json`](../skills/catalog.json).
  Install one, or tick several and install them for one or both clients.
- **Add**: any GitHub `owner/repo`, `owner/repo/path`, `https://github.com/.../tree/<ref>/path`,
  Git URL or local folder. The app looks inside, lists every `SKILL.md` it finds (`skills/*`,
  `.claude/skills/*`, `plugins/*/skills/*`, or the folder itself), and installs the ones you pick.

Updates compare the skill folder's git tree hash with the source's default branch, so unrelated
commits do not count. Community entries are pinned to a commit and update when the catalog's
`sha` moves.

## Contributing a skill

See [Listing a skill](../CONTRIBUTING.md#listing-a-skill).
