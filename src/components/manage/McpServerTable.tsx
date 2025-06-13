import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useBatchActions } from "@/hooks/useBatchActions";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useDecryptedServers } from "@/hooks/useDecryptedServers";
import { ServerConfig, ServerTableData } from "@/types";
import { Cloud, Monitor } from "lucide-react";
import { useCallback, useState } from "react";
import { BatchActionsDropdown } from "./BatchActionsDropdown";
import { CloudSyncDialog } from "./CloudSyncDialog";
import { LocalSyncDialog } from "./LocalSyncDialog";
import { useServerTableColumns } from "./ServerTableColumns";

interface McpServerTableProps {
  servers: ServerTableData[];
  onEdit: (name: string, config: ServerConfig) => void;
  onDisable: (name: string) => Promise<void>;
  onDelete: (name: string) => void;
  onEnable: (name: string) => Promise<void>;
  onSync: (
    fromClient: string,
    toClient: string,
    overrideAll: boolean,
  ) => Promise<void>;
  disabledServers: Record<string, ServerConfig>;
  currentClient: string;
  onBatchDelete: (names: string[]) => Promise<void>;
  onCloudDownloadSuccess: () => Promise<void>;
}

export const McpServerTable = ({
  servers,
  onEdit,
  onDisable,
  onDelete,
  onEnable,
  onSync,
  disabledServers,
  currentClient,
  onBatchDelete,
  onCloudDownloadSuccess,
}: McpServerTableProps) => {
  const [localSyncDialogOpen, setLocalSyncDialogOpen] = useState(false);
  const [cloudSyncDialogOpen, setCloudSyncDialogOpen] = useState(false);
  const decryptionState = useDecryptedServers(servers);
  const { isSyncing, handleCloudUpload, handleCloudDownload } = useCloudSync(
    currentClient,
    decryptionState.decryptedServers,
  );

  const {
    rowSelection,
    setRowSelection,
    setTableInstance,
    isDeleting,
    handleBatchDisable,
    handleBatchEnable,
    handleBatchDelete,
  } = useBatchActions({
    onBatchDelete,
    onDisable,
    onEnable,
    disabledServers,
  });

  const handleSync = useCallback(
    async (fromClient: string, toClient: string, overrideAll: boolean) => {
      try {
        await onSync(fromClient, toClient, overrideAll);
      } catch (error) {
        console.error("Sync failed:", error);
      }
    },
    [onSync],
  );

  const columns = useServerTableColumns({
    disabledServers,
    onEnable,
    onDisable,
    onEdit,
    onDelete,
  });

  if (decryptionState.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Loading server configurations...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Manage your MCP server configurations
        </h2>
        <div className="flex gap-2">
          <BatchActionsDropdown
            hasSelectedRows={Object.keys(rowSelection).length > 0}
            handleBatchEnable={handleBatchEnable}
            handleBatchDisable={handleBatchDisable}
            handleBatchDelete={handleBatchDelete}
            isDeleting={isDeleting}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocalSyncDialogOpen(true)}
            disabled={isSyncing}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Local Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCloudSyncDialogOpen(true)}
            disabled={isSyncing}
          >
            <Cloud className="h-4 w-4 mr-2" />
            Cloud Sync
          </Button>
        </div>
      </div>

      {(isDeleting || decryptionState.isLoading) && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {isDeleting ? "Deleting selected servers..." : "Loading server configurations..."}
            </p>
          </div>
        </div>
      )}

      {decryptionState.error && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {decryptionState.error}
          </p>
        </div>
      )}

      <LocalSyncDialog
        open={localSyncDialogOpen}
        onOpenChange={setLocalSyncDialogOpen}
        onSync={handleSync}
        currentClient={currentClient}
        isSyncing={isSyncing}
      />

      <CloudSyncDialog
        open={cloudSyncDialogOpen}
        onOpenChange={setCloudSyncDialogOpen}
        onCloudUpload={handleCloudUpload}
        onCloudDownload={handleCloudDownload}
        isSyncing={isSyncing}
        servers={decryptionState.decryptedServers}
        onCloudDownloadSuccess={onCloudDownloadSuccess}
      />

      <DataTable
        columns={columns}
        data={decryptionState.decryptedServers}
        searchKey="name"
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        onTableInstanceChange={setTableInstance}
      />
    </div>
  );
};
