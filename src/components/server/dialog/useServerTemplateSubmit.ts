import { useMcpRefresh } from "@/contexts/McpRefreshContext";
import { useAuth } from "@/hooks/useAuth";
import { useIsFreeUser } from "@/hooks/useTier";
import { useGlobalDialogStore } from "@/stores/globalDialogStore";
import { useStatsStore } from "@/stores/statsStore";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { transformConfig } from "../utils/transformConfig";

// Custom hook to provide submit handlers for server template dialog
export function useServerTemplateSubmit({
  serverName,
  setIsDialogOpen,
  config,
  serverType,
  selectedClient,
  selectedPath,
}: {
  serverName: string;
  setIsDialogOpen: (open: boolean) => void;
  config: any;
  serverType: string;
  selectedClient: string;
  selectedPath: string | undefined;
}) {
  const { refreshServerList } = useMcpRefresh();
  const { isAuthenticated } = useAuth();
  const isFreeUser = useIsFreeUser();
  const personalStats = useStatsStore((s) => s.personalStats);
  const showGlobalDialog = useGlobalDialogStore((s) => s.showDialog);

  const FREE_SERVER_LIMIT = 1;
  const isLimitedUser = !isAuthenticated || isFreeUser;

  // Handle submit (add to local config)
  const handleSubmit = async () => {
    if (isLimitedUser && personalStats.total >= FREE_SERVER_LIMIT) {
      showGlobalDialog(isAuthenticated ? "upgrade" : "login");
      return;
    }
    try {
      const finalConfig = transformConfig(serverType, config);
      await invoke("add_mcp_server", {
        clientName: selectedClient,
        path: selectedPath || undefined,
        serverName: serverName,
        serverConfig: finalConfig,
      });
      
      // Refresh the server list automatically
      refreshServerList(selectedClient, selectedPath);
      
      toast.success("Configuration updated successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(`Error updating config: ${error}`);
      toast.error("Failed to update configuration");
    }
  };

  return { handleSubmit };
}
