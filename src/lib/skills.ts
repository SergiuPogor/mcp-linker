// Agent skills for Claude Code and Codex, through mcpl-core's skills module (src-tauri/crates/mcpl-core/src/skills.rs).
import { invoke } from "@tauri-apps/api/core";
import bundledCatalog from "../../skills/catalog.json";
import type { PluginClient } from "./plugins";

export interface Skill {
  name: string;
  description: string | null;
  path: string;
  claudeCode: boolean;
  codex: boolean;
  /** `owner/repo` or URL; none for skills made by hand. */
  source: string | null;
  installedRef: string | null;
}

export interface SkillDoc {
  name: string;
  description: string | null;
  markdown: string;
  files: string[];
  path: string;
}

export interface FoundSkill {
  name: string;
  description: string | null;
  path: string;
}

export interface Discovered {
  source: string;
  commit: string | null;
  skills: FoundSkill[];
}

/** One item of a batch; `error` set when it failed, `note` for what was left alone. */
export interface Outcome {
  name: string;
  error: string | null;
  note: string | null;
}

export interface SkillUpdate {
  name: string;
  latestRef: string | null;
}

export const hasSkill = (skill: Skill, client: PluginClient) => (client === "claude-code" ? skill.claudeCode : skill.codex);

export const listSkills = () => invoke<Skill[]>("skill_list");
export const readSkill = (name: string) => invoke<SkillDoc>("skill_read", { name });
export const setSkillClient = (names: string[], client: PluginClient, enabled: boolean) => invoke<Outcome[]>("skill_set_client", { names, client, enabled });
export const uninstallSkills = (names: string[]) => invoke<Outcome[]>("skill_uninstall", { names });
export const discoverSkills = (source: string, gitRef?: string) => invoke<Discovered>("skill_discover", { source, gitRef: gitRef || null });
export const installSkills = (source: string, names: string[], clients: PluginClient[], gitRef?: string) =>
  invoke<Outcome[]>("skill_install", { source, gitRef: gitRef || null, names, clients });
export const checkSkillUpdates = () => invoke<SkillUpdate[]>("skill_check_updates");
export const updateSkills = (names: string[]) => invoke<Outcome[]>("skill_update", { names });

/** A skill offered by MCP Linker's catalog (skills/catalog.json), installed or not. */
export interface CatalogSkill {
  name: string;
  description: string;
  category?: string;
  /** Maintained by MCP Linker, as opposed to submitted by the community. */
  curated?: boolean;
  /** GitHub `owner/repo`. */
  repo: string;
  /** Folder of the skill inside the repo. */
  path: string;
  /** Pinned commit; community entries must have one. */
  sha?: string;
  homepage?: string;
  keywords?: string[];
}

export const CATALOG_REPO = "milisp/mcp-linker";
const CATALOG_URL = `https://raw.githubusercontent.com/${CATALOG_REPO}/main/skills/catalog.json`;

/** Bundled copy of the catalog, shown when GitHub can't be reached. */
export const bundledSkills: CatalogSkill[] = bundledCatalog.skills as CatalogSkill[];

export const fetchCatalog = async (): Promise<CatalogSkill[]> => {
  // In dev, read the checked-out catalog so local edits show before they reach main.
  if (import.meta.env.DEV) return bundledSkills;
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return ((await response.json()) as { skills: CatalogSkill[] }).skills;
};

/** What `skill_install` takes for a catalog entry. */
export const catalogSource = (skill: CatalogSkill) => `${skill.repo}/${skill.path}`;
