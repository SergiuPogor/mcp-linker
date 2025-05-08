// ServerConfigDialog.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServerConfig, ServerType, SseConfig, StdioServerConfig } from "@/types";
import capitalizeFirstLetter from "@/utils/title";
import { forwardRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { ArgsTextarea } from "./ArgsTextarea";
import { CommandInput } from "./CommandInput";
import { ConfigTabs } from "./ConfigTabs";
import { EnvEditor } from "./EnvEditor";
import { ServerNameInput } from "./ServerNameInput";
import { useLocalDraft } from "./useLocalDraft";
import { useSaveServerConfig } from "./useSaveServerConfig";

interface ServerConfigDialogProps {
  isOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  currentServer: ServerType;
  selectedClient: string;
  selectedPath: string;
  mcpServers: any;
}

export const ServerConfigDialog = forwardRef<
  HTMLDivElement,
  ServerConfigDialogProps
>(
  ({
    isOpen,
    setIsDialogOpen,
    currentServer,
    selectedClient,
    selectedPath,
    mcpServers,
  }) => {
    const [serverName, setServerName] = useState<string>("");
    const [config, setConfig] = useState<ServerConfig | null>(null);
    const [curIndex, setCurIndex] = useState<number>(0);
    const [configs, setConfigs] = useState<ServerConfig[] | null>(null);
    const [envValues, setEnvValues] = useState<Record<string, string>>({});
    const { t } = useTranslation();

    const { clearDraft } = useLocalDraft({
      isOpen,
      serverName,
      setServerName,
      config,
      setConfig,
      envValues,
      setEnvValues,
    });

    const { saveServerConfig } = useSaveServerConfig();

    // Initialize server data
    useEffect(() => {
      if (isOpen && currentServer) {
        setServerName(currentServer.name);
        setConfigs(currentServer.configs);

        if (currentServer.configs?.length > 0) {
          setConfig(currentServer.configs[0]);
          setCurIndex(0);
        }

        // Initialize envValues with empty strings
        if (currentServer.configs?.[0] && "env" in currentServer.configs[0]) {
          const stdioConfig = currentServer.configs[0] as StdioServerConfig;
          if (stdioConfig.env) {
            const initialEnvValues = Object.keys(
              stdioConfig.env
            ).reduce(
              (acc, key) => {
                acc[key] = "";
                return acc;
              },
              {} as Record<string, string>,
            );
            setEnvValues(initialEnvValues);
          }
        }

        // Clear saved draft when server changes
        clearDraft();
      }
    }, [isOpen, currentServer?.name]);

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
        const stdioConfig = config as StdioServerConfig;
        setConfig({ 
          ...config, 
          env: { ...(stdioConfig.env || {}), [key]: value } 
        });
      }
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
      }
      console.log(serverConfig)
      await saveServerConfig(serverConfig);
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="overflow-y-auto max-h-[90vh] w-[90vw] max-w-3xl bg-background dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">config</DialogTitle>
            <DialogDescription>server config</DialogDescription>
          </DialogHeader>

          <ServerNameInput serverName={serverName} onChange={setServerName} />

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
              <>
                <CommandInput
                  command={config.command}
                  onChange={handleCommandChange}
                />
                <ArgsTextarea args={config.args} onChange={handleArgsChange} />
                <EnvEditor
                  env={config.env || {}}
                  envValues={envValues}
                  setEnvValues={setEnvValues}
                  onEnvChange={handleEnvChange}
                  isEdit={false}
                />
              </>
            )}

            {/* SseConfig specific fields */}
            {config && "url" in config && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium">
                      URL
                    </label>
                    <input
                      id="url"
                      value={config.url || ""}
                      onChange={(e) =>
                        setConfig({ ...config, url: e.target.value } as SseConfig)
                      }
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">
                      Type
                    </label>
                    <select
                      id="type"
                      value={config.type}
                      onChange={(e) =>
                        setConfig({ 
                          ...config, 
                          type: e.target.value as "http" | "sse" 
                        } as SseConfig)
                      }
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    >
                      <option value="http">HTTP</option>
                      <option value="sse">SSE</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Headers</label>
                  <textarea
                    value={
                      config.headers
                        ? JSON.stringify(config.headers, null, 2)
                        : "{}"
                    }
                    onChange={(e) => {
                      try {
                        const headers = JSON.parse(e.target.value);
                        setConfig({ ...config, headers } as SseConfig);
                      } catch (err) {
                        // Handle parsing error
                      }
                    }}
                    className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}
          </div>

          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {t("addTo")} {capitalizeFirstLetter(selectedClient)}
          </Button>
        </DialogContent>
      </Dialog>
    );
  },
);

ServerConfigDialog.displayName = "ServerConfigDialog";
