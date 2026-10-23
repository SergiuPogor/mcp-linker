// Lets `bun dev` render the UI in a plain browser, without the Rust backend.
// Loaded only when Tauri's IPC bridge is missing; commands answer with canned data.
import { mockIPC, mockWindows } from "@tauri-apps/api/mocks";

const client = (id: string, label: string, tier: string, extra: Record<string, unknown> = {}) => ({
  id,
  label,
  url: "https://example.com",
  storage: "json",
  serversKey: "mcpServers",
  location: "user",
  projectFile: null,
  disable: "stash",
  tier,
  ...extra,
});

const CLIENTS = [
  client("claude", "Claude Desktop", "free"),
  client("cursor", "Cursor", "free", { location: "userOrProject", projectFile: ".cursor/mcp.json", disable: "flag" }),
  client("cline", "Cline", "plus", { disable: "flag" }),
  client("claude_code", "Claude Code", "pro", { storage: "claudeCode", location: "claudeCode", disable: "native" }),
  client("codex", "Codex", "pro", { storage: "codexToml", disable: "native" }),
];

const SERVERS = {
  mcpServers: {
    filesystem: { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"] },
    github: { command: "npx", args: ["-y", "@modelcontextprotocol/server-github"], env: { GITHUB_TOKEN: "ghp_xxx" } },
    context7: { type: "http", url: "https://mcp.context7.com/mcp" },
  },
};

const LICENSE = {
  licensed: false,
  tier: "free",
  displayKey: null,
  deviceId: "browser-preview",
  updatesUntil: null,
  updatesExpired: false,
};

const plugin = (name: string, description: string, extra: Record<string, unknown> = {}) => ({
  id: `${name}@mock`,
  name,
  displayName: null,
  marketplace: "mock",
  description,
  category: "development",
  version: "1.0.0",
  homepage: null,
  official: true,
  community: false,
  curated: false,
  installed: false,
  enabled: false,
  scope: null,
  path: null,
  icon: null,
  iconUrl: null,
  ...extra,
});

const PLUGINS = [
  plugin("github", "Triage issues, review pull requests and manage repositories from the agent.", { installed: true, enabled: true }),
  plugin("linear", "Create and update Linear issues without leaving the conversation.", { installed: true }),
  plugin("figma", "Turn Figma frames into code and read design tokens."),
  plugin("sentry", "Pull crashes and stack traces into the session and triage them."),
  plugin("vercel", "Deploy previews, read build logs and manage environment variables."),
  plugin("notion", "Search and edit Notion pages and databases."),
];

const SKILLS = [
  { name: "pdf", description: "Read, merge, split, fill and OCR PDF files.", path: "/mock/pdf", claudeCode: true, codex: false, source: "anthropics/skills", installedRef: null },
  { name: "ios-simulator-build-run", description: "Build an iOS app and run it on the Simulator, then read build errors and logs.", path: "/mock/ios", claudeCode: true, codex: true, source: "milisp/skills", installedRef: null },
  { name: "my-notes", description: null, path: "/mock/notes", claudeCode: false, codex: true, source: null, installedRef: null },
];

const ANSWERS: Record<string, unknown> = {
  list_clients: CLIENTS,
  license_status: LICENSE,
  read_json_file: SERVERS,
  read_app_settings: {},
  list_disabled_servers: {},
  list_workspaces: [],
  claude_mcp_list: [],
  claude_list_disabled: {},
  claude_list_projects: [],
  check_claude_config_exists: true,
  check_command_exists: true,
  plugin_list: [],
  plugin_marketplaces: [],
  plugin_activity: [],
  plugin_catalog: { marketplaces: [], plugins: PLUGINS },
  skill_list: SKILLS,
  plugin_check_updates: {
    updates: [
      { id: "document-skills@anthropic-agent-skills", name: "document-skills", marketplace: "anthropic-agent-skills", installed: "dbd4588f9e10", latest: "5c0e7a21b9d3", latestDate: new Date(Date.now() - 2 * 3_600_000).toISOString() },
      { id: "swift-lsp@claude-plugins-official", name: "swift-lsp", marketplace: "claude-plugins-official", installed: "1.0.0", latest: "1.1.0", latestDate: null },
    ],
    refreshError: null,
  },
  skill_check_updates: [
    {
      name: "pdf",
      latestRef: "d41f2a9c0b7e4a1f8c3d5e6f708192a3b4c5d6e7",
      installedRef: "3a9e1c7b5d2f4086a1b3c5d7e9f0123456789abc",
      latestDate: new Date(Date.now() - 12 * 60_000).toISOString(),
      changedFiles: ["SKILL.md", "scripts/extract_text.py", "scripts/fill_form.py", "reference/forms.md"],
      changedTotal: 4,
    },
    {
      name: "ios-simulator-build-run",
      latestRef: "99aa11bb22cc33dd44ee55ff66778899aabbccdd",
      installedRef: "0123456789abcdef0123456789abcdef01234567",
      latestDate: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      changedFiles: Array.from({ length: 20 }, (_, i) => `references/section-${i + 1}/some-longer-file-name.md`),
      changedTotal: 27,
    },
    { name: "my-notes", latestRef: "ffeeddccbbaa99887766554433221100ffeeddcc", installedRef: null, latestDate: null, changedFiles: [], changedTotal: 0 },
  ],
};

export function installBrowserMock() {
  mockWindows("main");
  mockIPC(
    (cmd, payload) => {
      if (cmd === "plugin:app|version") return "0.0.0-browser";
      if (cmd.startsWith("plugin:")) return null;
      if (cmd in ANSWERS) return ANSWERS[cmd];
      console.warn(`[browser-mock] unmocked command: ${cmd}`, payload);
      return null;
    },
    { shouldMockEvents: true },
  );
  // plugin-os reads its platform from a global the Tauri webview injects.
  Object.assign(window, {
    __TAURI_OS_PLUGIN_INTERNALS__: { os_type: "macos", platform: "macos", family: "unix", arch: "aarch64", version: "0", eol: "\n", exe_extension: "" },
  });
}
