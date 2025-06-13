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
        console.log(servers, currentClient, overrideAll)
        await uploadConfigsToCloud(servers, currentClient, overrideAll);
        toast.success("Configurations uploaded to cloud successfully.");
      } catch (error) {
        console.error("Cloud upload failed:", error);
        toast.error("Cloud upload failed");
      } finally {
        setIsSyncing(false);
      }
    },
    [servers, currentClient],
  );

  const handleCloudDownload = useCallback(
    async () => {
      try {
        setIsSyncing(true);
        const serverConfigs = await downloadConfigsFromCloud(currentClient);

        // Iterate over downloaded configurations and save them locally
        for (const config of serverConfigs) {
          // The backend add_mcp_server handles both adding and updating
          const serverItem = {
            clientName: selectedClient,
            path: selectedPath || "",
            serverName: config.name,
            serverConfig: config,
          };
          
          try {
            await invoke("add_mcp_server", serverItem);
          } catch (error) {
            console.error(error)
          }
        }

        toast.success("Configurations downloaded from cloud successfully.");
      } catch (error) {
        console.error("Cloud download failed:", error);
        toast.error("Cloud download failed");
      } finally {
        setIsSyncing(false);
      }
    },
    [currentClient],
  );

  return {
    isSyncing,
    handleCloudUpload,
    handleCloudDownload,
  };
}; 