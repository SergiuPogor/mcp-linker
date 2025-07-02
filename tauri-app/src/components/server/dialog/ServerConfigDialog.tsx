// ServerConfigDialog.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ServerConfig, ServerType, SseConfig } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useEffect } from "react";
import { toast } from "sonner";

import { fetchServerConfig } from "@/lib/api";
import { useClientPathStore } from "@/stores/clientPathStore";
import { useConfigFileStore } from "@/stores/configFileStore";
import { useTeamStore } from "@/stores/team";
import { invoke } from "@tauri-apps/api/core";
import { ServerConfigForm } from "../form/ServerConfigForm";
import {
  useLocalDraft,
  useSaveServerConfig,
  useServerConfigDialog,
} from "../hooks";
import { ServerConfigDialogHeader } from "./ServerConfigDialogHeader";

interface ServerConfigDialogProps {
  isOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  currentServer: ServerType;
}

export const ServerConfigDialog = forwardRef<
  HTMLDivElement,
  ServerConfigDialogProps
>(({ isOpen, setIsDialogOpen, currentServer }, _ref) => {
  const { selectedClient, selectedPath } = useClientPathStore();
  const { saveServerConfig } = useSaveServerConfig();
  const { getTeamConfigPath } = useConfigFileStore();
  const { selectedTeamId } = useTeamStore();

  const queryResult = useQuery({
    queryKey: ["configs", currentServer?.id],
    queryFn: () => {
      if (!currentServer?.id) throw new Error("No server ID");
      return fetchServerConfig(currentServer.id);
    },
    enabled: isOpen && !!currentServer,
    staleTime: 1000 * 60 * 60 * 24 * 7,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  // Show toast on fetch error (404 or others)
  useEffect(() => {
    if (queryResult.error) {
      const err = queryResult.error as Error;
      if (err.message.includes("404") || err.message.includes("not found")) {
        toast.error(
          "Configuration not found: The server may not be set up yet.",
        );
      } else {
        toast.error(`Failed to load configuration: ${err.message}`);
      }
    }
  }, [queryResult.error]);

  const { clearDraft } = useLocalDraft();

  const {
    serverName,
    setServerName,
    config,
    setConfig,
    curIndex,
    setCurIndex,
    configs,
    envValues,
    setEnvValues,
  } = useServerConfigDialog({
    isOpen,
    currentServer,
    queryResult,
    clearDraft: () => clearDraft(),
  });

  // Update draftProps whenever relevant state changes
  useEffect(() => {
    clearDraft({
      serverName,
      setServerName,
      config,
      setConfig,
      envValues,
      setEnvValues,
      isOpen,
    });
  }, [serverName, config, envValues, isOpen]);

  const handleArgsChange = (value: string) => {
    if (config && "command" in config) {
      // Only update if the value has actually changed
      const newArgs = value.split(" ").filter((arg) => arg !== "");
      if (JSON.stringify(newArgs) !== JSON.stringify(config.args)) {
        setConfig({ ...config, args: newArgs });
      }
    }
  };

  const handleCommandChange = (value: string) => {
    if (config && "command" in config) {
      setConfig({ ...config, command: value });
    }
  };

  const handleEnvChange = (key: string, value: string) => {
    if (config && "command" in config) {
      setConfig({
        ...config,
        env: { ...(config.env || {}), [key]: value },
      });
    }
  };

  const handleSseConfigChange = (newConfig: SseConfig) => {
    setConfig(newConfig);
  };

  const handleConfigChange = (c: ServerConfig, index: number) => {
    setConfig(c);
    setCurIndex(index);
  };

  const handleSubmit = async () => {
    if (
      !selectedPath &&
      (selectedClient === "custom" || selectedClient === "vscode")
    ) {
      toast.error("Path is required");
      return;
    }
    const serverConfig = {
      selectedClient,
      selectedPath: selectedPath || "",
      currentServer,
      serverName,
      config,
      setIsDialogOpen,
    };
    console.log(serverConfig);
    await saveServerConfig(serverConfig);
    clearDraft(); // Clear the draft after successful save
  };

  const handleSubmitTeamLocal = async () => {
    try {
      await invoke("add_mcp_server", {
        clientName: "custom",
        path: getTeamConfigPath(selectedTeamId),
        serverName: serverName,
        serverConfig: config,
      });
      toast.success(`add to Team Local ok`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "fail to add to Team Local");
    } finally {
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="overflow-y-auto max-h-[90vh] w-[90vw] max-w-3xl bg-background dark:bg-gray-800">
        <ServerConfigDialogHeader />

        {/* Main server config form extracted to a reusable component */}
        <ServerConfigForm
          serverName={serverName}
          setServerName={setServerName}
          // Ensure configs is always an array, never null
          configs={configs ?? []}
          curIndex={curIndex}
          onConfigChange={handleConfigChange}
          // Ensure config is never null, fallback to an empty object or suitable default if needed
          config={config ?? ({} as ServerConfig)}
          envValues={envValues}
          setEnvValues={setEnvValues}
          onCommandChange={handleCommandChange}
          onArgsChange={handleArgsChange}
          onEnvChange={handleEnvChange}
          onSseConfigChange={handleSseConfigChange}
          onSubmit={handleSubmit}
          selectedClient={selectedClient}
          onSubmitTeamLocal={handleSubmitTeamLocal}
        />
      </DialogContent>
    </Dialog>
  );
});

ServerConfigDialog.displayName = "ServerConfigDialog";
