import type { RegistryServer } from "@/lib/registry/types";
import catalogIndex from "../../../registry/index.json";

export type { RegistryServer } from "@/lib/registry/types";

export interface CollectionFile {
  title: string;
  description: string;
  servers: string[];
}

// The catalog lives in /registry. index.json lists the hand-ordered entries first;
// every other server file follows, alphabetically, so a new server needs no edit there.
const serverFiles = import.meta.glob<RegistryServer>("/registry/servers/*.json", { eager: true, import: "default" });
const collectionFiles = import.meta.glob<CollectionFile>("/registry/collections/*.json", { eager: true, import: "default" });

const serverPath = (id: string) => `/registry/servers/${id}.json`;
const ordered = new Set(catalogIndex.servers);
const unordered = Object.keys(serverFiles)
  .map(path => path.slice("/registry/servers/".length, -".json".length))
  .filter(id => !ordered.has(id))
  .sort();

export const MCP_REGISTRY_SERVERS: RegistryServer[] = [...ordered, ...unordered].flatMap(id => serverFiles[serverPath(id)] ?? []);

export const MCP_COLLECTIONS: Record<string, CollectionFile> = Object.fromEntries(
  (catalogIndex.collections ?? []).flatMap(id => {
    const collection = collectionFiles[`/registry/collections/${id}.json`];
    return collection ? [[id, collection]] : [];
  }),
);
