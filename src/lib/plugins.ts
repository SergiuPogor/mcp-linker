// Claude Code and Codex plugins, through mcpl-core's plugins module (src-tauri/crates/mcpl-core/src/plugins.rs).
import { invoke } from "@tauri-apps/api/core";

export type PluginClient = "claude-code" | "codex";

export const PLUGIN_CLIENTS: { id: PluginClient; label: string }[] = [
  { id: "claude-code", label: "Claude Code" },
  { id: "codex", label: "Codex" },
];

export const otherClient = (client: PluginClient): PluginClient => (client === "claude-code" ? "codex" : "claude-code");

/** The marketplace with MCP Linker's own plugin packs (plugins/ in this repo). */
export const PACKS_MARKETPLACE = "milisp/mcp-linker";

export interface Plugin {
  /** name@marketplace */
  id: string;
  name: string;
  marketplace: string;
  client: PluginClient;
  version: string | null;
  enabled: boolean;
  scope: string | null;
  path: string | null;
}

export interface PluginDetails extends Plugin {
  description: string | null;
  mcpServers: Record<string, Record<string, unknown>>;
  skills: { name: string; description: string | null }[];
  /** Claude Code-only parts (commands, agents, hooks, …), left out when copying to Codex. */
  other: string[];
}

export interface Marketplace {
  name: string;
  source: string | null;
}

export interface CopyReport {
  id: string;
  mcpServers: string[];
  skills: string[];
  skipped: string[];
}

export const listPlugins = (client: PluginClient) => invoke<Plugin[]>("plugin_list", { client });
export const pluginDetails = (client: PluginClient, id: string) => invoke<PluginDetails>("plugin_details", { client, id });
export const setPluginEnabled = (client: PluginClient, id: string, enabled: boolean) =>
  invoke<void>("plugin_set_enabled", { client, id, enabled });
export const installPlugin = (client: PluginClient, id: string) => invoke<void>("plugin_install", { client, id });
export const uninstallPlugin = (client: PluginClient, id: string) => invoke<void>("plugin_uninstall", { client, id });
export const listMarketplaces = (client: PluginClient) => invoke<Marketplace[]>("plugin_marketplaces", { client });
export const addMarketplace = (client: PluginClient, source: string) => invoke<void>("plugin_add_marketplace", { client, source });
export const copyPlugin = (from: PluginClient, to: PluginClient, id: string) => invoke<CopyReport>("plugin_copy", { from, to, id });
