// ServerConfigDialog.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ServerConfig, ServerType, SseConfig } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useEffect } from "react";
import { toast } from "sonner";

import { fetchServerConfig } from "@/lib/api";
import { useClientPathStore } from "@/store/clientPathStore";
import { LabeledInput } from "../../shared/LabeledInput";
import { ConfigTabs } from "../config";
import { SseConfigForm } from "../form/SseConfigForm";
import { StdioConfigForm } from "../form/StdioConfigForm";
import {
  useLocalDraft,
  useSaveServerConfig,
  useServerConfigDialog,
} from "../hooks";
import { ServerConfigDialogFooter } from "./ServerConfigDialogFooter";
import { ServerConfigDialogHeader } from "./ServerConfigDialogHeader";

interface ServerConfigDialogProps {
  isOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  currentServer: ServerType;
  mcpServers: any;
}

export const ServerConfigDialog = forwardRef<
  HTMLDivElement,
  ServerConfigDialogProps
>(({ isOpen, setIsDialogOpen, currentServer, mcpServers }) => {
  const { selectedClient, selectedPath } = useClientPathStore();
  const { saveServerConfig } = useSaveServerConfig();

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
    const serverConfig = {
      selectedClient,
      selectedPath,
      currentServer,
      mcpServers,
      serverName,
      config,
      setIsDialogOpen,
    };
    console.log(serverConfig);
    await saveServerConfig(serverConfig);
    clearDraft(); // Clear the draft after successful save
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="overflow-y-auto max-h-[90vh] w-[90vw] max-w-3xl bg-background dark:bg-gray-800">
        <ServerConfigDialogHeader />

        <LabeledInput
          label="Server name"
          value={serverName}
          onChange={setServerName}
        />

        {configs && configs.length > 0 && (
          <ConfigTabs
            configs={configs}
            curIndex={curIndex}
            onConfigChange={handleConfigChange}
          />
        )}

        <div className="grid gap-4 py-4">
          {/* StdioServerConfig specific fields */}
          {config && "command" in config && (
            <StdioConfigForm
              config={config}
              envValues={envValues}
              setEnvValues={setEnvValues}
              onCommandChange={handleCommandChange}
              onArgsChange={handleArgsChange}
              onEnvChange={handleEnvChange}
            />
          )}

          {/* SseConfig specific fields */}
          {config && "url" in config && (
            <SseConfigForm
              config={config}
              onConfigChange={handleSseConfigChange}
            />
          )}
        </div>

        <ServerConfigDialogFooter
          onSubmit={handleSubmit}
          selectedClient={selectedClient}
        />
      </DialogContent>
    </Dialog>
  );
});

ServerConfigDialog.displayName = "ServerConfigDialog";
