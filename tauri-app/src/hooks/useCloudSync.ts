import {
  downloadConfigsFromCloud,
  uploadConfigsToCloud,
} from "@/lib/cloud-sync";
import { useClientPathStore } from "@/stores/clientPathStore";
import { ServerTableData } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useCloudSync = (
  currentClient: string,
  servers: ServerTableData[],
) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { selectedClient, selectedPath } = useClientPathStore();

  const handleCloudUpload = useCallback(
    async (overrideAll: boolean) => {
      try {
        setIsSyncing(true);
        console.log(servers, overrideAll);
        await uploadConfigsToCloud(servers, overrideAll);
        toast.success("Configurations uploaded to cloud successfully.");
      } catch (error) {
        console.error("Cloud upload failed:", error);
        toast.error("Cloud upload failed");
      } finally {
        setIsSyncing(false);
      }
    },
    [servers],
  );

  const fetchCloudDownload = useCallback(async () => {
    try {
      const serverConfigs = await downloadConfigsFromCloud();
      return serverConfigs;
    } catch (e) {
      // Try to show the most useful error info
      const msg =
        e instanceof Error
          ? e.message + (e.stack ? "\n" + e.stack : "")
          : JSON.stringify(e);
      toast.error(msg);
    }
  }, []);

  const handleCloudDownload = useCallback(async () => {
    try {
      setIsSyncing(true);
      const serverConfigs = await downloadConfigsFromCloud();

      // Iterate over downloaded configurations and save them locally
      for (const config of serverConfigs) {
        // The backend add_mcp_server handles both adding and updating
        const _serverItem = {
          clientName: selectedClient,
          path: selectedPath || "",
          serverName: config.name,
        };
        try {
          await invoke("enable_mcp_server", _serverItem);
        } catch (error) {}
        const serverItem = {
          clientName: selectedClient,
          path: selectedPath || "",
          serverName: config.name,
          serverConfig: config,
        };
        try {
          await invoke("add_mcp_server", serverItem);
        } catch (error) {}
      }

      toast.success("Configurations downloaded from cloud successfully.");
    } catch (error) {
      console.error("Cloud download failed:", error);
      toast.error("Cloud download failed");
    } finally {
      setIsSyncing(false);
    }
  }, [currentClient]);

  return {
    isSyncing,
    handleCloudUpload,
    handleCloudDownload,
    fetchCloudDownload,
  };
};
