import { ServerCard } from "@/components/manage/ServerCard";
import { useClientPathStore } from "@/store/clientPathStore";
import { ConfigType } from "@/types/config";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";
// import { needspathClient } from "@/lib/data";

export default function McpManage() {
  const { selectedClient, selectedPath } = useClientPathStore();

  const [config, setConfig] = useState<ConfigType>({
    mcpServers: {},
  });

  useEffect(() => {
    loadConfig();
  }, [selectedClient, selectedPath]);

  async function loadConfig() {
    try {
      const data = await invoke<ConfigType>("read_json_file", {
        clientName: selectedClient,
        path: selectedPath || undefined,
      });
      if (data) {
        setConfig(data);
      } else {
        setConfig({ mcpServers: {} });
      }
    } catch (error) {
      console.error(`Error loading config: ${error}`);
      toast.error("Failed to load configuration");
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
      toast.error("Failed to update configuration");
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
      // If backend operation fails, restore the previous state
      console.error(`Error deleting config: ${error}`);
      toast.error("Failed to delete configuration");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 p-2">
      {Object.entries(config.mcpServers).map(([key, serverConfigs]) => (
        <ServerCard
          key={key}
          serverKey={key}
          config={serverConfigs}
          onUpdate={handleUpdate}
          onDelete={deleteConfigKey}
        />
      ))}
    </div>
  );
}
