import { needspathClient } from "@/lib/data";
import { ConfigType } from "@/types/mcpConfig";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useMcpConfig(
  selectedClient: string,
  selectedPath: string | null,
) {
  const [config, setConfig] = useState<ConfigType>({ mcpServers: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disabledServers, setDisabledServers] = useState<Record<string, any>>(
    {},
  );

  const loadConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (needspathClient.includes(selectedClient) && !selectedPath) {
        toast("Path is required for custom client");
      }

      const data = await invoke<ConfigType>("read_json_file", {
        clientName: selectedClient,
        path: selectedPath || undefined,
      });

      setConfig(data?.mcpServers ? data : { mcpServers: {} });

      // Load disabled servers
      const disabledData = await invoke<Record<string, any>>(
        "list_disabled_servers",
        {
          clientName: selectedClient,
          path: selectedPath || undefined,
        },
      );
      setDisabledServers(disabledData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load configuration";
      setError(errorMessage);
      setConfig({ mcpServers: {} });
      setDisabledServers({});
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = async (
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update configuration";
      toast.error(errorMessage);
    }
  };

  const deleteConfig = async (key: string) => {
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete configuration";
      toast.error(errorMessage);
    }
  };

  const enableServer = async (key: string) => {
    try {
      await invoke("enable_mcp_server", {
        clientName: selectedClient,
        path: selectedPath || undefined,
        serverName: key,
      });
      await loadConfig();
      toast.success("Server enabled successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to enable server";
      toast.error(errorMessage);
    }
  };

  const disableServer = async (key: string) => {
    try {
      await invoke("disable_mcp_server", {
        clientName: selectedClient,
        path: selectedPath || undefined,
        serverName: key,
      });
      await loadConfig();
      toast.success("Server disabled successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to disable server";
      toast.error(errorMessage);
    }
  };

  const syncConfig = async (
    fromClient: string,
    toClient: string,
    overrideAll: boolean,
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      await invoke("sync_mcp_config", {
        fromClient,
        toClient,
        fromPath: null,
        toPath: null,
        overrideAll,
      });

      // Reload configuration after sync
      try {
        const data = await invoke<ConfigType>("read_json_file", {
          clientName: selectedClient,
          path: selectedPath || undefined,
        });
        setConfig(data?.mcpServers ? data : { mcpServers: {} });

        const disabledData = await invoke<Record<string, any>>(
          "list_disabled_servers",
          {
            clientName: selectedClient,
            path: selectedPath || undefined,
          },
        );
        setDisabledServers(disabledData);

        toast.success(
          `Configuration synced from ${fromClient} to ${toClient} successfully`,
        );
      } catch (loadError) {
        const loadErrorMessage =
          loadError instanceof Error
            ? loadError.message
            : "Failed to reload configuration after sync";
        setError(loadErrorMessage);
        toast.error(loadErrorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to sync configuration";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [selectedClient, selectedPath]);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    deleteConfig,
    loadConfig,
    disabledServers,
    enableServer,
    disableServer,
    syncConfig,
  };
}
