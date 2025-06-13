// Cloud sync API functions for MCP server configurations
import { apiClient } from "@/lib/apiClient";
import { ServerConfig, ServerTableData } from "@/types";

export interface CloudConfig {
  id: string;
  server_name: string;
  mcp_client: string;
  encrypt_config_data: any;
  created_at: string;
  updated_at: string;
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
        : await fn(endpoint, { data: body });
    return response.data as T;
  } catch (error: any) {
    throw new Error(`API call to ${endpoint} failed: ${error.message}`);
  }
};

// Upload a single configuration to cloud
const uploadSingleConfig = async (
  config: ServerTableData,
  currentClient: string,
  overrideAll: boolean,
) => {
  const { name, ...serverConfig } = config;
  const payload = {
    server_name: name,
    mcp_client: currentClient,
    encrypt_config_data: serverConfig,
  };
  try {
    await callCloudApi(`/user-server-configs/`, "POST", payload);
  } catch (error: any) {
    if (error.message.includes("status 409") && !overrideAll) {
      await updateCloudConfig(name, currentClient, serverConfig);
    } else {
      throw new Error(`Failed to upload config ${name}: ${error.message}`);
    }
  }
};

// Upload configurations to cloud
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

    // Upload each configuration concurrently
    await Promise.all(
      configs.map((config) =>
        uploadSingleConfig(config, currentClient, overrideAll),
      ),
    );
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
      `/user-server-configs/?mcp_client=${encodeURIComponent(currentClient)}`,
    );
    const cloudConfigs: CloudConfig[] = data.configs || [];

    // Convert cloud configs to ServerTableData format
    const serverConfigs: ServerTableData[] = cloudConfigs.map((config) => ({
      name: config.server_name,
      ...config.encrypt_config_data,
    }));

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
      `/user-server-configs/?mcp_client=${encodeURIComponent(currentClient)}`,
    );
    const configs: CloudConfig[] = data.configs || [];

    const lastSync =
      configs.length > 0
        ? configs.reduce((latest, config) => {
            const configDate = new Date(config.updated_at);
            return configDate > new Date(latest) ? config.updated_at : latest;
          }, configs[0].updated_at)
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
  config: ServerConfig,
): Promise<void> => {
  try {
    // First, get the config ID
    const existingConfig: CloudConfig = await callCloudApi(
      `/user-server-configs/by-server-client/?server_name=${encodeURIComponent(serverName)}&mcp_client=${encodeURIComponent(mcpClient)}`,
    );

    // Update the configuration
    await callCloudApi(`/user-server-configs/${existingConfig.id}`, "PUT", {
      encrypt_config_data: config,
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
      `/user-server-configs/?mcp_client=${encodeURIComponent(mcpClient)}`,
    );
    const configs: CloudConfig[] = data.configs || [];

    // Delete each configuration
    for (const config of configs) {
      try {
        await callCloudApi(`/user-server-configs/${config.id}`, "DELETE");
      } catch (error) {
        console.warn(`Failed to delete config ${config.server_name}:`, error);
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
