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
  plugin_catalog: { marketplaces: [], plugins: [] },
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
