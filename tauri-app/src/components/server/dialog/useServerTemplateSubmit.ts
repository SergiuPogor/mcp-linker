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
  // Handle submit (add to local config)
  const handleSubmit = async () => {
    try {
      const finalConfig = transformConfig(serverType, config);
      await invoke("add_mcp_server", {
        clientName: selectedClient,
        path: selectedPath || undefined,
        serverName: serverName,
        serverConfig: finalConfig,
      });
      toast.success("Configuration updated successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(`Error updating config: ${error}`);
      toast.error("Failed to update configuration");
    }
  };

  return { handleSubmit };
}
