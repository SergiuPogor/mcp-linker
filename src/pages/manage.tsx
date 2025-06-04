import { ServerCard } from "@/components/manage/ServerCard";
import { useClientPathStore } from "@/stores/clientPathStore";
import { ConfigType } from "@/types/mcpConfig";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function McpManage() {
  const { selectedClient, selectedPath } = useClientPathStore();

  const [config, setConfig] = useState<ConfigType>({
    mcpServers: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, [selectedClient, selectedPath]);

  // Helper function to ensure config has the correct structure
  const normalizeConfig = (data: any): ConfigType => {
    if (!data || typeof data !== "object") {
      return { mcpServers: {} };
    }

    // Ensure mcpServers exists and is an object
    if (!data.mcpServers || typeof data.mcpServers !== "object") {
      data.mcpServers = {};
    }

    return data as ConfigType;
  };

  async function loadConfig() {
    setIsLoading(true);
    setError(null);
    try {
      // Validate path for Windows systems
      if (selectedClient === "custom" && !selectedPath) {
        throw new Error("Path is required for custom client");
      }

      const data = await invoke<ConfigType>("read_json_file", {
        clientName: selectedClient,
        path: selectedPath || undefined,
      });

      // Normalize the received config to ensure it has the correct structure
      const normalizedConfig = normalizeConfig(data);
      setConfig(normalizedConfig);
    } catch (error) {
      console.error(`Error loading config: ${error}`);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load configuration";
      setError(errorMessage);

      // Set default config even on error to prevent white screen
      setConfig({ mcpServers: {} });

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdate = async (
    key: string,
    updatedConfig: ConfigType["mcpServers"][string],
  ) => {
    try {
      await invoke("update_mcp_server", {
        clientName: selectedClient,
        path: selectedPath || undefined,
        serverName: key,
        serverConfig: updatedConfig,
      });
      await loadConfig();
      toast.success("Configuration updated successfully");
    } catch (error) {
      console.error(`Error updating config: ${error}`);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update configuration";
      toast.error(errorMessage);
    }
  };

  async function deleteConfigKey(key: string) {
    if (selectedClient === "custom" && !selectedPath) {
      toast.error(
        "Cannot delete config: selectedPath is required for custom app",
      );
      return;
    }
    try {
      await invoke("remove_mcp_server", {
        clientName: selectedClient,
        path: selectedPath || undefined,
        serverName: key,
      });
      await loadConfig();
      toast.success("Configuration deleted successfully");
    } catch (error) {
      console.error(`Error deleting config: ${error}`);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete configuration";
      toast.error(errorMessage);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <h3 className="text-red-800 font-medium">
            Error Loading Configuration
          </h3>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={loadConfig}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Safely get servers, fallback to empty object if undefined
  const servers = config?.mcpServers || {};

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 p-2">
      {Object.entries(servers).map(([key, serverConfigs]) => (
        <ServerCard
          key={key}
          serverKey={key}
          config={serverConfigs}
          onUpdate={handleUpdate}
          onDelete={deleteConfigKey}
        />
      ))}
      {Object.keys(servers).length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          No servers configured yet
        </div>
      )}
    </div>
  );
}
