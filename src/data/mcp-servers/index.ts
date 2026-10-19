import type { RegistryServer } from "@/lib/registry/types";
import catalogIndex from "../../../registry/index.json";

export type { RegistryServer } from "@/lib/registry/types";

export interface CollectionFile {
  title: string;
  description: string;
  servers: string[];
}

// The catalog lives in /registry; index.json sets the display order.
const serverFiles = import.meta.glob<RegistryServer>("/registry/servers/*.json", { eager: true, import: "default" });
const collectionFiles = import.meta.glob<CollectionFile>("/registry/collections/*.json", { eager: true, import: "default" });

export const MCP_REGISTRY_SERVERS: RegistryServer[] = catalogIndex.servers.flatMap(id => serverFiles[`/registry/servers/${id}.json`] ?? []);

export const MCP_COLLECTIONS: Record<string, CollectionFile> = Object.fromEntries(
  (catalogIndex.collections ?? []).flatMap(id => {
    const collection = collectionFiles[`/registry/collections/${id}.json`];
    return collection ? [[id, collection]] : [];
  }),
);
