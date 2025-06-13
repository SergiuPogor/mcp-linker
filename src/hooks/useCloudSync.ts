import {
  downloadConfigsFromCloud,
  uploadConfigsToCloud,
} from "@/lib/cloud-sync";
import { ServerTableData } from "@/types";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useCloudSync = (
  currentClient: string,
  servers: ServerTableData[],
) => {
  const [isSyncing, setIsSyncing] = useState(false);

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
        await downloadConfigsFromCloud(currentClient);
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