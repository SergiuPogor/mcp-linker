import { PageLoadingFallback } from "@/components/common/LoadingConfig";
import { McpServerTable } from "@/components/manage/McpServerTable";
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
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <h3 className="text-red-800 font-medium">
            Error Loading Configuration
          </h3>
          <p className="text-red-600 mt-2">{error}</p>
          <div className="mt-4 space-x-2">
            <button
              onClick={() => loadConfig()}
              className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
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
