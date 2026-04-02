// Cloud sync functions for MCP server configurations (via Supabase)
import supabase from "@/utils/supabase";
import { ServerTableData } from "@/types";
import {
  decryptConfig,
  encryptConfig,
  ensureEncryptionKey,
  getEncryptionKey,
} from "@/utils/encryption";

export interface CloudConfig {
  id: string;
  serverName: string;
  encryptConfigData: any;
  createdAt: string;
  updatedAt: string;
}

export interface CloudSyncStatus {
  total: number;
  lastSync: string | null;
  hasChanges: boolean;
}

async function getUserId(): Promise<string> {
  if (!supabase) throw new Error("Supabase not initialized");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session.user.id;
}

// Upload a single configuration to cloud
export const uploadSingleConfig = async (
  config: ServerTableData,
  _overrideAll: boolean,
) => {
  if (!supabase) throw new Error("Supabase not initialized");
  const userId = await getUserId();

  const { name, ...serverConfig } = config;
  const encryptionKey = getEncryptionKey("personal");
  if (!encryptionKey) throw new Error("Encryption key not found");
  const encryptedConfig = await encryptConfig(
    JSON.stringify(serverConfig),
    encryptionKey,
  );

  const { error } = await supabase.from("user_server_configs").upsert(
    {
      user_id: userId,
      server_name: name,
      encrypt_config_data: encryptedConfig,
    },
    { onConflict: "user_id,server_name" },
  );

  if (error) throw new Error(`Failed to upload config ${name}: ${error.message}`);
};

// Upload configurations to cloud (batch)
export const uploadConfigsToCloud = async (
  configs: ServerTableData[],
  overrideAll: boolean = false,
): Promise<void> => {
  if (!supabase) throw new Error("Supabase not initialized");
  const userId = await getUserId();

  if (overrideAll) {
    await deleteAllCloudConfigs();
  }

  const encryptionKey = await ensureEncryptionKey();
  const rows = await Promise.all(
    configs.map(async (config) => {
      const { name, ...serverConfig } = config;
      const encryptedConfig = await encryptConfig(
        JSON.stringify(serverConfig),
        encryptionKey,
      );
      return {
        user_id: userId,
        server_name: name,
        encrypt_config_data: encryptedConfig,
      };
    }),
  );

  const { error } = await supabase
    .from("user_server_configs")
    .upsert(rows, { onConflict: "user_id,server_name" });

  if (error) throw new Error(`Batch upload failed: ${error.message}`);
};

// Download configurations from cloud
export const downloadConfigsFromCloud = async (): Promise<ServerTableData[]> => {
  if (!supabase) throw new Error("Supabase not initialized");
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("user_server_configs")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Download from cloud failed: ${error.message}`);

  const encryptionKey = await ensureEncryptionKey();

  const serverConfigs: ServerTableData[] = (
    await Promise.all(
      (data || []).map(async (row) => {
        if (
          !row.encrypt_config_data ||
          typeof row.encrypt_config_data !== "string"
        ) {
          console.warn(
            `Missing or invalid encrypted data for config: ${row.server_name}`,
          );
          return null;
        }
        const decryptedString = await decryptConfig(
          row.encrypt_config_data,
          encryptionKey,
        );
        const decryptedConfig = JSON.parse(decryptedString);
        return { name: row.server_name, ...decryptedConfig, id: row.id };
      }),
    )
  ).filter((item): item is ServerTableData => item !== null);

  console.log("serverConfigs: ", serverConfigs);
  return serverConfigs;
};

// Get cloud sync status
export const getCloudSyncStatus = async (): Promise<CloudSyncStatus> => {
  if (!supabase) return { total: 0, lastSync: null, hasChanges: false };
  try {
    const userId = await getUserId();

    const { data, error } = await supabase
      .from("user_server_configs")
      .select("updated_at")
      .eq("user_id", userId);

    if (error) return { total: 0, lastSync: null, hasChanges: false };

    const rows = data || [];
    const lastSync =
      rows.length > 0
        ? rows.reduce((latest, row) => {
            const d = new Date(row.updated_at);
            return d > new Date(latest) ? row.updated_at : latest;
          }, rows[0].updated_at)
        : null;

    return { total: rows.length, lastSync, hasChanges: false };
  } catch {
    return { total: 0, lastSync: null, hasChanges: false };
  }
};

// Delete a single cloud config by id
export const deleteCloudConfig = async (configId: string): Promise<void> => {
  if (!supabase) throw new Error("Supabase not initialized");
  const userId = await getUserId();

  const { error } = await supabase
    .from("user_server_configs")
    .delete()
    .eq("id", configId)
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to delete config: ${error.message}`);
};

// Delete all cloud configs for the current user
export const deleteAllCloudConfigs = async (): Promise<void> => {
  if (!supabase) throw new Error("Supabase not initialized");
  const userId = await getUserId();

  const { error } = await supabase
    .from("user_server_configs")
    .delete()
    .eq("user_id", userId);

  if (error) throw new Error(`Failed to delete all configs: ${error.message}`);
};

// Compare local and cloud configurations to detect changes
export const detectConfigChanges = async (
  localConfigs: ServerTableData[],
): Promise<boolean> => {
  try {
    const cloudConfigs = await downloadConfigsFromCloud();

    if (localConfigs.length !== cloudConfigs.length) return true;

    const localConfigMap = new Map(
      localConfigs.map((config) => [config.name, config]),
    );

    for (const cloudConfig of cloudConfigs) {
      const localConfig = localConfigMap.get(cloudConfig.name);
      if (
        !localConfig ||
        JSON.stringify(localConfig) !== JSON.stringify(cloudConfig)
      ) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
};
