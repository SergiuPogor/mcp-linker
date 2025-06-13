// Cloud sync API functions for MCP server configurations
import { apiClient } from "@/lib/apiClient";
import { ServerTableData } from "@/types";
import { decryptConfig, encryptConfig, ensureEncryptionKey } from "@/utils/encryption";

export interface CloudConfig {
  id: string;
  serverName: string;
  mcpClient: string;
  encryptConfigData: any;
  createdAt: string;
  updatedAt: string;
}

export interface CloudSyncStatus {
  total: number;
  lastSync: string | null;
  hasChanges: boolean;
}

const methodMap = {
  GET: apiClient.get.bind(apiClient),
  POST: apiClient.post.bind(apiClient),
  PUT: apiClient.put.bind(apiClient),
  DELETE: apiClient.delete.bind(apiClient),
};

const callCloudApi = async <T>(
  endpoint: string,
  method: keyof typeof methodMap = "GET",
  body: object | null = null,
): Promise<T> => {
  try {
    const fn = methodMap[method];
    const response =
      method === "GET" || method === "DELETE"
        ? await fn(endpoint)
        : await fn(endpoint, body || {});
    return response.data as T;
  } catch (error: any) {
    throw new Error(`API call to ${endpoint} failed: ${error.message}`);
  }
};

// Upload a single configuration to cloud
export const uploadSingleConfig = async (
  config: ServerTableData,
  currentClient: string,
  overrideAll: boolean,
) => {
  const { name, ...serverConfig } = config;
  
  // Get encryption key and encrypt the config
  const encryptionKey = await ensureEncryptionKey();
  // Stringify the config before encryption
  const configString = JSON.stringify(serverConfig);
  const encryptedConfig = await encryptConfig(configString, encryptionKey);
  
  const payload = {
    serverName: name,
    mcpClient: currentClient,
    encryptConfigData: encryptedConfig,
  };
  try {
    await callCloudApi(`/user-server-configs/`, "POST", payload);
  } catch (error: any) {
    if (error.message.includes("status 409") && !overrideAll) {
      await updateCloudConfig(name, currentClient, encryptedConfig);
    } else {
      throw new Error(`Failed to upload config ${name}: ${error.message}`);
    }
  }
};

// Upload configurations to cloud using batch sync endpoint
export const uploadConfigsToCloud = async (
  configs: ServerTableData[],
  currentClient: string,
  overrideAll: boolean = false,
): Promise<void> => {
  try {
    // If override mode, delete existing configs first
    if (overrideAll) {
      await deleteAllCloudConfigs(currentClient);
    }

    // Prepare payload for batch sync
    const encryptionKey = await ensureEncryptionKey();
    const batchPayload = await Promise.all(
        configs.map(async (config) => {
          const { name, ...serverConfig } = config;
          const configString = JSON.stringify(serverConfig);
          const encryptedConfig = await encryptConfig(configString, encryptionKey);
          return {
            serverName: name,
            mcpClient: currentClient,
            encryptConfigData: encryptedConfig,
          };
        }),
      );

    // Call batch sync API
    await callCloudApi(`/user-server-configs/batch-sync?override_existing=${overrideAll}`, "POST", batchPayload);
  } catch (error) {
    console.error("Upload to cloud failed:", error);
    throw error;
  }
};

// Download configurations from cloud
export const downloadConfigsFromCloud = async (
  currentClient: string,
): Promise<ServerTableData[]> => {
  try {
    const data: { configs: CloudConfig[] } = await callCloudApi(
      `/user-server-configs/?mcpClient=${encodeURIComponent(currentClient)}`,
    );
    console.log('cloud data', data)
    const cloudConfigs: CloudConfig[] = data.configs || [];

    // Get encryption key for decryption
    const encryptionKey = await ensureEncryptionKey();

    // Convert cloud configs to ServerTableData format and decrypt
    const serverConfigs: ServerTableData[] = (
        await Promise.all(
          cloudConfigs.map(async (config) => {
            if (!config.encryptConfigData || typeof config.encryptConfigData !== "string") {
              console.warn(`Missing or invalid encrypted data for config: ${config.serverName}`);
              return null;
            }
      
            const decryptedString = await decryptConfig(config.encryptConfigData, encryptionKey);
            const decryptedConfig = JSON.parse(decryptedString);
            return {
              name: config.serverName,
              ...decryptedConfig,
            };
          }),
        )
      ).filter((item): item is ServerTableData => item !== null);

    console.log('serverConfigs: ', serverConfigs)

    return serverConfigs;
  } catch (error) {
    console.error("Download from cloud failed:", error);
    throw error;
  }
};

// Get cloud sync status
export const getCloudSyncStatus = async (
  currentClient: string,
): Promise<CloudSyncStatus> => {
  try {
    const data: { configs: CloudConfig[] } = await callCloudApi(
      `/user-server-configs/?mcpClient=${encodeURIComponent(currentClient)}`,
    );
    const configs: CloudConfig[] = data.configs || [];

    const lastSync =
      configs.length > 0
        ? configs.reduce((latest, config) => {
            const configDate = new Date(config.updatedAt);
            return configDate > new Date(latest) ? config.updatedAt : latest;
          }, configs[0].updatedAt)
        : null;

    return {
      total: configs.length,
      lastSync,
      hasChanges: false, // This would require comparing local vs cloud configs
    };
  } catch (error) {
    console.error("Failed to get cloud sync status:", error);
    return { total: 0, lastSync: null, hasChanges: false };
  }
};

// Update existing cloud configuration
const updateCloudConfig = async (
  serverName: string,
  mcpClient: string,
  encryptedConfig: string,
): Promise<void> => {
  try {
    // First, get the config ID
    const existingConfig: CloudConfig = await callCloudApi(
      `/user-server-configs/by-server-client/?serverName=${encodeURIComponent(serverName)}&mcpClient=${encodeURIComponent(mcpClient)}`,
    );

    // Update the configuration
    await callCloudApi(`/user-server-configs/${existingConfig.id}`, "PUT", {
      encryptConfigData: encryptedConfig,
    });
  } catch (error) {
    console.error("Update cloud config failed:", error);
    throw error;
  }
};

// Delete all cloud configurations for a client
const deleteAllCloudConfigs = async (mcpClient: string): Promise<void> => {
  try {
    const data: { configs: CloudConfig[] } = await callCloudApi(
      `/user-server-configs/?mcpClient=${encodeURIComponent(mcpClient)}`,
    );
    const configs: CloudConfig[] = data.configs || [];

    // Delete each configuration
    for (const config of configs) {
      try {
        await callCloudApi(`/user-server-configs/${config.id}`, "DELETE");
      } catch (error) {
        console.warn(`Failed to delete config ${config.serverName}:`, error);
      }
    }
  } catch (error) {
    console.error("Delete all cloud configs failed:", error);
    throw error;
  }
};

// Compare local and cloud configurations to detect changes
export const detectConfigChanges = async (
  localConfigs: ServerTableData[],
  currentClient: string,
): Promise<boolean> => {
  try {
    const cloudConfigs = await downloadConfigsFromCloud(currentClient);

    // Simple comparison - in a real implementation, you might want more sophisticated diffing
    if (localConfigs.length !== cloudConfigs.length) {
      return true;
    }

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
  } catch (error) {
    console.error("Failed to detect config changes:", error);
    return false;
  }
};
