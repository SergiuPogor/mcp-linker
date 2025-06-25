// Main LocalTable component, refactored to use hooks and header component
// Always use English comments for code
import { CloudSyncDialog } from "@/components/manage/CloudSyncDialog";
import { LocalSyncDialog } from "@/components/manage/LocalSyncDialog";
import { RefreshMcpConfig } from "@/components/manage/RefreshMcpConfig";
import { DataTable } from "@/components/ui/data-table";
import { useCloudSync } from "@/hooks/useCloudSync";
import { useMcpConfig } from "@/hooks/useMcpConfig";
import { useClientPathStore } from "@/stores/clientPathStore";
import { useGlobalDialogStore } from "@/stores/globalDialogStore";
import { getEncryptionKey } from "@/utils/encryption";
import { RowSelectionState, Table } from "@tanstack/react-table";
import { useState } from "react";
import { useServerTableColumns } from "../ServerTableColumns";
import { LocalTableHeader } from "./LocalTableHeader";
import { useServersData } from "./useServersData";
import { useSyncHandlers } from "./useSyncHandlers";

interface LocalTableProps {
  userTier?: string;
  isAuthenticated: boolean;
}

export const LocalTable = ({ userTier, isAuthenticated }: LocalTableProps) => {
  const { selectedClient, selectedPath } = useClientPathStore();
  const [localSyncDialogOpen, setLocalSyncDialogOpen] = useState(false);
  const [cloudSyncDialogOpen, setCloudSyncDialogOpen] = useState(false);
  const [isDeleting, _setIsDeleting] = useState(false);
  const [_tableInstance, setTableInstance] = useState<Table<any> | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const showGlobalDialog = useGlobalDialogStore((s) => s.showDialog);

  const {
    config,
    disabledServers,
    syncConfig,
    updateConfig,
    deleteConfig,
    enableServer,
    disableServer,
    batchDeleteServers,
    error,
    loadConfig,
  } = useMcpConfig(selectedClient, selectedPath);

  const serversData = useServersData(config, disabledServers, selectedClient);

  const { isSyncing, handleCloudUpload, handleCloudDownload } = useCloudSync(
    selectedClient,
    serversData,
  );

  // Batch actions
  const handleBatchDelete = async () => {
    try {
      const selectedIndices = Object.keys(rowSelection);
      const selectedNames = selectedIndices.map(
        (index) => serversData[parseInt(index)].name,
      );
      await batchDeleteServers(selectedNames);
      setRowSelection({});
    } catch (error) {
      console.error("Batch delete operation failed:", error);
    }
  };

  const handleBatchEnable = async () => {
    const selectedIndices = Object.keys(rowSelection);
    const selectedNames = selectedIndices.map(
      (index) => serversData[parseInt(index)].name,
    );
    for (const name of selectedNames) {
      await enableServer(name);
    }
    setRowSelection({});
  };

  const handleBatchDisable = async () => {
    const selectedIndices = Object.keys(rowSelection);
    const selectedNames = selectedIndices.map(
      (index) => serversData[parseInt(index)].name,
    );
    for (const name of selectedNames) {
      await disableServer(name);
    }
    setRowSelection({});
  };

  // Edit handler
  const handleEdit = (
    name: string,
    serverConfig: any,
    isDisabled?: boolean,
  ) => {
    updateConfig(name, serverConfig, isDisabled);
  };

  // Sync handlers
  const { handleSync } = useSyncHandlers(
    syncConfig,
    handleCloudUpload,
    handleCloudDownload,
  );

  // Header action handlers
  const handleLocalSync = () => setLocalSyncDialogOpen(true);
  const handleCloudSync = () => {
    if (!isAuthenticated) {
      showGlobalDialog("login");
      return;
    }
    if (userTier === "FREE") {
      showGlobalDialog("upgrade");
      return;
    }
    const key = getEncryptionKey();
    if (!key) {
      showGlobalDialog("login");
    } else {
      setCloudSyncDialogOpen(true);
    }
  };

  const localColumns = useServerTableColumns({
    disabledServers,
    onEnable: enableServer,
    onDisable: disableServer,
    onEdit: handleEdit,
    onDelete: deleteConfig,
  });

  return (
    <div className="flex flex-col">
      <LocalTableHeader
        isSyncing={isSyncing}
        rowSelection={rowSelection}
        isDeleting={isDeleting}
        onLocalSync={handleLocalSync}
        onCloudSync={handleCloudSync}
        handleBatchEnable={handleBatchEnable}
        handleBatchDisable={handleBatchDisable}
        handleBatchDelete={handleBatchDelete}
      />
      {error ? (
        <RefreshMcpConfig error={error} onRetry={loadConfig} />
      ) : (
        <>
          <DataTable
            columns={localColumns}
            data={serversData}
            searchKey="name"
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            onTableInstanceChange={setTableInstance}
          />
          <LocalSyncDialog
            open={localSyncDialogOpen}
            onOpenChange={setLocalSyncDialogOpen}
            onLocalSync={handleSync}
            currentClient={selectedClient}
            isSyncing={isSyncing}
            userTier={userTier}
          />
          <CloudSyncDialog
            open={cloudSyncDialogOpen}
            onOpenChange={setCloudSyncDialogOpen}
            onCloudUpload={handleCloudUpload}
            onCloudDownload={handleCloudDownload}
            isSyncing={isSyncing}
            servers={serversData}
            onCloudDownloadSuccess={loadConfig}
          />
        </>
      )}
    </div>
  );
};
