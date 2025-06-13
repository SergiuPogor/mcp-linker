// useServerConfig.ts
import { ServerConfig, ServerType, StdioServerConfig } from "@/types";
import { UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface UseServerConfigProps {
  isOpen: boolean;
  currentServer: ServerType | null;
  queryResult: UseQueryResult<any, unknown>;
  clearDraft: () => void;
}

export const useServerConfigDialog = ({
  isOpen,
  currentServer,
  queryResult,
  clearDraft,
}: UseServerConfigProps) => {
  const [serverName, setServerName] = useState<string>("");
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [curIndex, setCurIndex] = useState<number>(0);
  const [configs, setConfigs] = useState<ServerConfig[] | null>(null);
  const [envValues, setEnvValues] = useState<Record<string, string>>({});

  const { data, isLoading, error } = queryResult;

  useEffect(() => {
    if (data) {
      console.log("Received config data:", data);
    }
  }, [data]);

  useEffect(() => {
    if (isOpen && currentServer) {
      console.log("Setting up dialog with server:", currentServer);

      // Always set the server name using the current server's name
      setServerName(currentServer.name);

      if (data && !isLoading) {
        console.log("Setting up dialog with data:", data);

        // Ensure configs is always an array
        const configArray = Array.isArray(data) ? data : [];
        setConfigs(configArray);

        if (configArray.length > 0) {
          // Find the first valid config (either with command or url)
          const defaultConfig =
            configArray.find(
              (cfg) =>
                cfg &&
                (("command" in cfg && cfg.command) ||
                  ("url" in cfg && cfg.url)),
            ) || configArray[0];

          console.log("Selected default config:", defaultConfig);
          setConfig(defaultConfig);
          setCurIndex(configArray.indexOf(defaultConfig));

          if (defaultConfig && "command" in defaultConfig) {
            const stdioConfig = defaultConfig as StdioServerConfig;
            const env = stdioConfig.env || {};
            console.log("Setting up env values from:", env);
            const initialEnvValues = Object.keys(env).reduce(
              (acc, key) => {
                acc[key] = env[key] || "";
                return acc;
              },
              {} as Record<string, string>,
            );
            setEnvValues(initialEnvValues);
          } else {
            setEnvValues({});
          }
        } else {
          // No configs in data, create a default one
          createDefaultConfig();
        }
      } else if (error || isLoading === false) {
        // Handle the case when fetchServerConfig returns 404 or other error
        console.log(
          "No configs found or error occurred, creating default config",
        );
        createDefaultConfig();
      }

      clearDraft();
    }
  }, [isOpen, currentServer, data, isLoading, error]);

  // Function to create a default StdioServerConfig
  const createDefaultConfig = () => {
    console.log("Creating default stdio config");
    const defaultStdioConfig: StdioServerConfig = {
      type: "stdio",
      command: "",
      args: [],
      env: {},
    };

    setConfigs([defaultStdioConfig]);
    setConfig(defaultStdioConfig);
    setCurIndex(0);
    setEnvValues({});
  };

  return {
    serverName,
    setServerName,
    config,
    setConfig,
    curIndex,
    setCurIndex,
    configs,
    setConfigs,
    envValues,
    setEnvValues,
    createDefaultConfig,
  };
};
