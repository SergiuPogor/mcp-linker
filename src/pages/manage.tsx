import { PageLoadingFallback } from "@/components/common/LoadingConfig";
import { McpServerTable } from "@/components/manage/McpServerTable";
import { RefreshMcpConfig } from "@/components/manage/RefreshMcpConfig";
import { useMcpConfig } from "@/hooks/useMcpConfig";
import { useClientPathStore } from "@/stores/clientPathStore";

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
  } = useMcpConfig(selectedClient, selectedPath);

  if (isLoading) {
    return <PageLoadingFallback />;
  }

  if (error) {
    return <RefreshMcpConfig error={error} onRetry={loadConfig} />;
  }

  // Transform servers object to array for DataTable
  const activeServersData = Object.entries(config?.mcpServers ?? {}).map(
    ([name, config]) => ({
      name,
      ...config,
    }),
  );

  const disabledServersData = Object.entries(disabledServers ?? {}).map(
    ([name, config]) => ({
      name,
      ...config,
    }),
  );

  // Combine all servers into a single array
  const allServersData = [...activeServersData, ...disabledServersData];

  return (
    <div className="p-4">
      <McpServerTable
        servers={allServersData}
        onEdit={(name, config) => updateConfig(name, config)}
        onDisable={disableServer}
        onDelete={deleteConfig}
        onEnable={enableServer}
        onSync={syncConfig}
        disabledServers={disabledServers}
        currentClient={selectedClient}
      />
    </div>
  );
}
