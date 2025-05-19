// useSaveServerConfig.ts
import type { ServerConfig, ServerType } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { LOCAL_STORAGE_KEY } from "./useLocalDraft";

interface SaveServerConfigParams {
  selectedClient: string;
  selectedPath: string;
  currentServer: ServerType;
  mcpServers: any[];
  serverName: string;
  config: ServerConfig | null;
  setIsDialogOpen: (open: boolean) => void;
}

export function useSaveServerConfig() {
  async function updateConfig(
    selectedClient: string,
    selectedPath: string,
    selectedServer: string,
    value: ServerConfig,
  ) {
    try {
      const server = {
        clientName: selectedClient,
        path: selectedPath,
        serverName: selectedServer,
        serverConfig: value,
      };
      await invoke("add_mcp_server", server);
      console.log("add server", new Date(), server);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const saveServerConfig = async ({
    selectedClient,
    selectedPath,
    currentServer,
    mcpServers,
    serverName,
    config,
    setIsDialogOpen,
  }: SaveServerConfigParams) => {
    if (selectedClient === "custom" && !selectedPath) {
      toast.error("Path is required");
      return;
    }
    if (!currentServer) {
      toast.error("Please select a server");
      return;
    }

    const client = mcpServers.find(
      (s: ServerType) => s.source === currentServer.source,
    );
    if (!client) {
      toast.error("Client not found");
      return;
    }

    if (client && config) {
      try {
        await updateConfig(selectedClient, selectedPath, client.name, config);
        try {
          console.log("Saving to myservers:", serverName, config);
          const savedMyServers = localStorage.getItem("myservers");
          console.log("Current myservers:", savedMyServers);
          const parsedMyServers = savedMyServers
            ? JSON.parse(savedMyServers)
            : [];

          const newServer = {
            name: serverName,
            config: config,
          };

          const index = parsedMyServers.findIndex(
            (s: any) => s.name === serverName,
          );
          if (index !== -1) {
            parsedMyServers[index] = newServer;
            console.log(`Updated existing server with name: ${serverName}`);
          } else {
            parsedMyServers.push(newServer);
            console.log(`Added new server with name: ${serverName}`);
          }

          localStorage.setItem("myservers", JSON.stringify(parsedMyServers));
          console.log("Updated myservers:", parsedMyServers);
        } catch (error) {
          console.error("Failed to save to myservers:", error);
        }
        setIsDialogOpen(false);
        toast.success("Configuration updated successfully");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to update config:", error);
        const message = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to update configuration: ${message}`);
      }
    }
  };

  return { saveServerConfig };
}
