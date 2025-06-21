import { BatchActionsDropdown } from "@/components/manage/BatchActionsDropdown";
import { RefreshMcpConfig } from "@/components/manage/RefreshMcpConfig";
import { TeamCloudSyncDialog } from "@/components/manage/team/CloudSyncDialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useMcpConfig } from "@/hooks/useMcpConfig";
import { useTeamCloudSync } from "@/hooks/useTeamCloudSync";
import { useConfigFileStore } from "@/stores/configFileStore";
import { useStatsStore } from "@/stores/statsStore";
import { useTeamStore } from "@/stores/team";
import { ServerConfig, ServerTableData } from "@/types";
import { getEncryptionKey } from "@/utils/encryption";
import { RowSelectionState, Table } from "@tanstack/react-table";
import { Cloud, Key } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServerTableColumns } from "./TeamServerTableColumns";

type TeamLocalTableProps = {};

export const TeamLocalTable = ({}: TeamLocalTableProps) => {
  const navigate = useNavigate();
  const { getTeamConfigPath } = useConfigFileStore();
  const { selectedTeamId } = useTeamStore();
  const filePath = getTeamConfigPath(selectedTeamId) ?? null;

  const [cloudSyncDialogOpen, setCloudSyncDialogOpen] = useState(false);
  const [isDeleting, _setIsDeleting] = useState(false);
  const [_tableInstance, setTableInstance] =
    useState<Table<ServerTableData> | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const {
    config,
    updateConfig,
    deleteConfig,
    batchDeleteServers,
    error,
    loadConfig,
  } = useMcpConfig("custom", filePath);

  const setTeamStats = useStatsStore((s) => s.setTeamStats);

  const serversData = useMemo((): ServerTableData[] => {
    const activeServers = Object.entries(config?.mcpServers ?? {}).map(
      ([name, serverConfig]) =>
        ({
          name,
          ...serverConfig,
        }) as ServerTableData,
    );
    // Set stats directly to Zustand store
    setTeamStats({
      total: activeServers.length,
    });
    return [...activeServers];
  }, [config?.mcpServers, setTeamStats]);

  const { isSyncing, handleCloudUpload: originalHandleCloudUpload } =
    useTeamCloudSync(serversData);

  const handleCloudUpload = useCallback(
    async (overrideAll: boolean) => {
      await originalHandleCloudUpload(selectedTeamId, overrideAll);
    },
    [originalHandleCloudUpload, selectedTeamId],
  );

  const handleEdit = useCallback(
    (name: string, serverConfig: ServerConfig, isDisabled?: boolean) => {
      updateConfig(name, serverConfig, isDisabled);
    },
    [updateConfig],
  );

  const handleBatchDelete = useCallback(async () => {
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
  }, [batchDeleteServers, rowSelection, serversData, setRowSelection]);

  const teamLocalColumns = useServerTableColumns({
    onEdit: handleEdit,
    onDelete: deleteConfig,
  });

  // Render error state if there's an error
  if (error) {
    return <RefreshMcpConfig error={error} onRetry={loadConfig} />;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="h-6 w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const key = getEncryptionKey(selectedTeamId);
              if (!key) {
                navigate("/settings");
              } else {
                setCloudSyncDialogOpen(true);
              }
            }}
            disabled={isSyncing}
            className="flex items-center gap-2 hover:bg-accent hover:border-accent-foreground"
          >
            <Cloud className="h-4 w-4" />
            Upload
            <Key className="h-3 w-3 opacity-60" />
          </Button>
        </div>
        <BatchActionsDropdown
          hasSelectedRows={Object.keys(rowSelection).length > 0}
          handleBatchDelete={handleBatchDelete}
          isDeleting={isDeleting}
        />
      </div>

      <DataTable
        columns={teamLocalColumns}
        data={serversData}
        searchKey="name"
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        onTableInstanceChange={setTableInstance}
      />

      <TeamCloudSyncDialog
        open={cloudSyncDialogOpen}
        onOpenChange={setCloudSyncDialogOpen}
        onCloudUpload={handleCloudUpload}
        isSyncing={isSyncing}
        servers={serversData}
        onCloudDownloadSuccess={loadConfig}
      />
    </div>
  );
};
