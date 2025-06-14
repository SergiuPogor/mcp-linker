import { ServerConfig } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseBatchActionsProps {
  onBatchDelete: (names: string[]) => Promise<void>;
  onDisable: (name: string) => Promise<void>;
  onEnable: (name: string) => Promise<void>;
  disabledServers: Record<string, ServerConfig>;
}

export const useBatchActions = ({
  onBatchDelete,
  onDisable,
  onEnable,
  disabledServers,
}: UseBatchActionsProps) => {
  const [rowSelection, setRowSelection] = useState({});
  const [tableInstance, setTableInstance] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset states when component unmounts
  useEffect(() => {
    return () => {
      setIsDeleting(false);
      setRowSelection({});
    };
  }, []);

  const handleBatchDisable = useCallback(async () => {
    if (!tableInstance) return;

    try {
      const selectedRows = tableInstance.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const serverName = row.original.name;
        const isEnabled = !disabledServers[serverName];
        if (isEnabled) {
          console.log("Disabling server:", serverName);
          await onDisable(serverName);
        }
      }
      setRowSelection({});
    } catch (error) {
      console.error("Batch disable failed:", error);
    }
  }, [tableInstance, onDisable, disabledServers]);

  const handleBatchEnable = useCallback(async () => {
    if (!tableInstance) return;

    try {
      const selectedRows = tableInstance.getSelectedRowModel().rows;
      for (const row of selectedRows) {
        const serverName = row.original.name;
        const isDisabled = !!disabledServers[serverName];
        if (isDisabled) {
          console.log("Enabling server:", serverName);
          await onEnable(serverName);
        }
      }
      setRowSelection({});
    } catch (error) {
      console.error("Batch enable failed:", error);
    }
  }, [tableInstance, onEnable, disabledServers]);

  const handleBatchDelete = useCallback(async () => {
    if (!tableInstance) return;

    const selectedRows = tableInstance.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      return;
    }

    try {
      setIsDeleting(true);
      const namesToDelete = selectedRows.map((row: any) => row.original.name);
      console.log("Batch deleting servers:", namesToDelete);
      await onBatchDelete(namesToDelete);

      // Clear selections after successful deletion
      if (tableInstance?.setRowSelection) {
        tableInstance.setRowSelection({});
      }
      setRowSelection({});
    } catch (error) {
      console.error("Batch delete failed:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [tableInstance, onBatchDelete]);

  return {
    rowSelection,
    setRowSelection,
    setTableInstance,
    isDeleting,
    handleBatchDisable,
    handleBatchEnable,
    handleBatchDelete,
  };
};
