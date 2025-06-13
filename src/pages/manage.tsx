import { PageLoadingFallback } from "@/components/common/LoadingConfig";
import { McpServerTable } from "@/components/manage/McpServerTable";
import { RefreshMcpConfig } from "@/components/manage/RefreshMcpConfig";
import { useMcpConfig } from "@/hooks/useMcpConfig";
import { useClientPathStore } from "@/stores/clientPathStore";
import { ServerTableData } from "@/types";
import { useCallback, useMemo } from "react";

export default function McpManage() {
  const { selectedClient, selectedPath } = useClientPathStore();
  const {
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
    batchDeleteServers,
  } = useMcpConfig(selectedClient, selectedPath);

  // Memoize server data transformation to prevent unnecessary recalculations
  const serversData = useMemo((): ServerTableData[] => {
    const activeServers = Object.entries(config?.mcpServers ?? {}).map(
      ([name, serverConfig]) =>
        ({
          name,
          ...serverConfig,
        }) as ServerTableData,
    );

    const disabledServersData = Object.entries(disabledServers ?? {}).map(
      ([name, serverConfig]) =>
        ({
          name,
          ...serverConfig,
        }) as ServerTableData,
    );

    return [...activeServers, ...disabledServersData];
  }, [config?.mcpServers, disabledServers]);

  // Memoize callback functions to prevent unnecessary re-renders
  const handleEdit = useCallback(
    (name: string, serverConfig: Parameters<typeof updateConfig>[1]) => {
      updateConfig(name, serverConfig);
    },
    [updateConfig],
  );

  const handleSync = useCallback(
    (fromClient: string, toClient: string, overrideAll: boolean) => {
      return syncConfig(fromClient, toClient, overrideAll);
    },
    [syncConfig],
  );

  // Wrap batchDeleteServers to handle loading state properly
  const handleBatchDelete = useCallback(
    async (names: string[]) => {
      try {
        await batchDeleteServers(names);
      } catch (error) {
        // Error is already handled in useMcpConfig
        console.error("Batch delete operation failed:", error);
        // Don't re-throw to prevent unhandled promise rejection
      }
    },
    [batchDeleteServers],
  );

  if (isLoading && !config.mcpServers) {
    return <PageLoadingFallback />;
  }

  if (error) {
    return <RefreshMcpConfig error={error} onRetry={loadConfig} />;
  }

  return (
    <div className="p-4">
      <McpServerTable
        servers={serversData}
        onEdit={handleEdit}
        onDisable={disableServer}
        onDelete={deleteConfig}
        onEnable={enableServer}
        onSync={handleSync}
        disabledServers={disabledServers}
        currentClient={selectedClient}
        onBatchDelete={handleBatchDelete}
        onCloudDownloadSuccess={loadConfig}
      />
    </div>
  );
}
