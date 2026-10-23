// Claude Code and Codex plugins, through mcpl-core's plugins module (src-tauri/crates/mcpl-core/src/plugins.rs).
import { invoke } from "@tauri-apps/api/core";
import packsMarketplace from "../../.claude-plugin/marketplace.json";
import type { Outcome } from "./skills";

export type PluginClient = "claude-code" | "codex";

export const PLUGIN_CLIENTS: { id: PluginClient; label: string }[] = [
  { id: "claude-code", label: "Claude Code" },
  { id: "codex", label: "Codex" },
];

export const otherClient = (client: PluginClient): PluginClient => (client === "claude-code" ? "codex" : "claude-code");

/** The marketplace with MCP Linker's own plugin packs (plugins/ in this repo). */
export const PACKS_MARKETPLACE = "milisp/mcp-linker";

export interface PackPlugin {
  name: string;
  description: string;
}

/** Bundled copy of the packs marketplace, shown when GitHub can't be reached. */
export const bundledPacks: PackPlugin[] = packsMarketplace.plugins;

const PACKS_URL = `https://raw.githubusercontent.com/${PACKS_MARKETPLACE}/main/.claude-plugin/marketplace.json`;

/** What the packs marketplace offers right now, so users can see inside before adding it. */
export const fetchPacks = async (): Promise<PackPlugin[]> => {
  const response = await fetch(PACKS_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as { plugins: PackPlugin[] };
  return data.plugins;
};

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
  /** Where the client keeps it on disk. */
  location: string | null;
}

/** One client CLI call, newest first in `pluginActivity`. */
export interface PluginActivity {
  at: number;
  command: string;
  ok: boolean;
  durationMs: number;
  output: string;
}

export interface CopyReport {
  id: string;
  mcpServers: string[];
  skills: string[];
  skipped: string[];
}

/** What happened to one plugin of a batch copy. */
export interface CopyResult {
  id: string;
  report: CopyReport | null;
  error: string | null;
}

export const listPlugins = (client: PluginClient) => invoke<Plugin[]>("plugin_list", { client });
export const pluginDetails = (client: PluginClient, id: string) => invoke<PluginDetails>("plugin_details", { client, id });
export const setPluginEnabled = (client: PluginClient, id: string, enabled: boolean) =>
  invoke<void>("plugin_set_enabled", { client, id, enabled });
export const installPlugin = (client: PluginClient, id: string) => invoke<string>("plugin_install", { client, id });
export const uninstallPlugin = (client: PluginClient, id: string) => invoke<void>("plugin_uninstall", { client, id });
export const listMarketplaces = (client: PluginClient) => invoke<Marketplace[]>("plugin_marketplaces", { client });
export const addMarketplace = (client: PluginClient, source: string, gitRef?: string, sparse?: string[]) =>
  invoke<string>("plugin_add_marketplace", { client, source, gitRef: gitRef || null, sparse: sparse?.length ? sparse : null });
export const copyPlugin = (from: PluginClient, to: PluginClient, id: string) => invoke<CopyReport>("plugin_copy", { from, to, id });
export const copyPlugins = (from: PluginClient, to: PluginClient, ids: string[]) => invoke<CopyResult[]>("plugin_copy_many", { from, to, ids });
/** An installed plugin whose marketplace now offers a newer version. */
export interface PluginUpdate {
  /** name@marketplace */
  id: string;
  name: string;
  marketplace: string;
  installed: string | null;
  /** A version number, or the start of a commit for plugins that have none. */
  latest: string;
  /** When the latest commit was made (ISO 8601), when the marketplace is a git checkout. */
  latestDate: string | null;
}

export interface PluginUpdateCheck {
  updates: PluginUpdate[];
  /** Why the marketplaces could not be refreshed first; the comparison then used what is on disk. */
  refreshError: string | null;
}

/** With `refresh` the client fetches its marketplaces first, so the answer is today's. */
export const checkPluginUpdates = (client: PluginClient, refresh: boolean) => invoke<PluginUpdateCheck>("plugin_check_updates", { client, refresh });
export const updatePlugins = (client: PluginClient, ids: string[]) => invoke<Outcome[]>("plugin_update", { client, ids });
export const pluginActivity = () => invoke<PluginActivity[]>("plugin_activity");

/** A plugin offered by one of the client's marketplaces, installed or not. */
export interface CatalogEntry {
  /** name@marketplace */
  id: string;
  name: string;
  displayName: string | null;
  marketplace: string;
  description: string | null;
  category: string | null;
  version: string | null;
  homepage: string | null;
  /** From the client vendor's own marketplace rather than one the user added. */
  official: boolean;
  /** Submitted to MCP Linker's marketplace by someone else, not one of its own packs. */
  community: boolean;
  /** One of MCP Linker's own packs. */
  curated: boolean;
  installed: boolean;
  enabled: boolean;
  scope: string | null;
  path: string | null;
  icon: string | null;
  /** A logo on the web (Codex's remote catalog). */
  iconUrl: string | null;
}

export interface Catalog {
  plugins: CatalogEntry[];
  marketplaces: Marketplace[];
}

export const pluginCatalog = (client: PluginClient) => invoke<Catalog>("plugin_catalog", { client });
/** A logo named by a remote catalog or registry, downloaded once into the cache folder; null unless it is a small picture from a listed host. */
export const remoteIcon = (url: string) => invoke<string | null>("remote_icon", { url });

/** The logo file as a data: URL. */
export const pluginIcon = (path: string) => invoke<string | null>("plugin_icon", { path });
