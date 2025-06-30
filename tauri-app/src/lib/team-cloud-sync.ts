// Cloud sync API functions for MCP server configurations
import { api } from "@/lib/api";
import { ServerTableData } from "@/types";
import {
  decryptConfig,
  encryptConfig,
  ensureEncryptionKey,
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

export const uploadTeamConfigs = async (
  teamId: string,
  configs: ServerTableData[],
): Promise<void> => {
  const encryptionKey = await ensureEncryptionKey();

  const payload = await Promise.all(
    configs.map(async (config) => {
      const { name, ...rest } = config;
      const configString = JSON.stringify(rest);
      const encrypted = await encryptConfig(configString, encryptionKey);

      return {
        server_name: name,
        config_data: encrypted,
      };
    }),
  );
  console.log("team payload", payload);

  try {
    if (teamId) {
      await api.post(`/teams/${teamId}/configs/batch`, payload);
    } else {
    }
  } catch (error: any) {
    console.error("Team batch upload failed:", error);
    throw error;
  }
};

export const fetchTeamConfigs = async (
  teamId: string,
): Promise<ServerTableData[]> => {
  try {
    const { data }: { data: CloudConfig[] } = await api.get(
      `/teams/${teamId}/configs`,
    );

    console.log("team config data", data);
    const cloudConfigs: CloudConfig[] = data || [];
    const encryptionKey = await ensureEncryptionKey();

    const serverConfigs: ServerTableData[] = (
      await Promise.all(
        cloudConfigs.map(async (config) => {
          if (
            !config.encryptConfigData ||
            typeof config.encryptConfigData !== "string"
          ) {
            console.warn(
              `Missing or invalid encrypted data for config: ${config.serverName}`,
            );
            return null;
          }

          const decryptedString = await decryptConfig(
            config.encryptConfigData,
            encryptionKey,
          );
          const decryptedConfig = JSON.parse(decryptedString);
          return {
            name: config.serverName,
            ...decryptedConfig,
            id: config.id,
          };
        }),
      )
    ).filter((item): item is ServerTableData => item !== null);

    console.log("serverConfigs: ", serverConfigs);

    return serverConfigs;
  } catch (error) {
    console.error("Fetch team configs failed:", error);
    throw error;
  }
};
