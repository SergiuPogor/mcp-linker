import { fetchTeamConfigs, uploadTeamConfigs } from "@/lib/team-cloud-sync";
import { ServerTableData } from "@/types";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useTeamCloudSync = (servers: ServerTableData[]) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCloudUpload = useCallback(
    async (teamId: string, overrideAll: boolean) => {
      try {
        setIsSyncing(true);
        console.log(teamId, servers, overrideAll);
        await uploadTeamConfigs(teamId, servers);
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

  const fetchCloudDownload = useCallback(async (teamId: string) => {
    try {
      setIsSyncing(true);
      const serverConfigs = await fetchTeamConfigs(teamId);
      return serverConfigs;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Cloud fetch failed");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    handleCloudUpload,
    fetchCloudDownload,
  };
};
