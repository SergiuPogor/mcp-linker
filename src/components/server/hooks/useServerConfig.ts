import type { ServerConfig, SseConfig, StdioServerConfig } from "@/types";
import { useEffect, useState } from "react";

export const useServerConfig = (isOpen: boolean, selectedClient: string) => {
  const [serverName, setServerName] = useState<string>("");
  const [serverType, setServerType] = useState<string>("stdio");
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [headerValues, setHeaderValues] = useState<Record<string, string>>({});

  // Create separate templates for different server types
  const stdioConfigTemplate: StdioServerConfig = {
    type: "stdio",
    command: "",
    args: [],
    env: {},
  };

  const networkConfigTemplate: SseConfig = {
    type: "sse",
    url: "http://localhost:8000/sse",
    headers: {},
  };

  // Use the appropriate template based on server type
  const configTemplate =
    serverType === "stdio" ? stdioConfigTemplate : networkConfigTemplate;

  const [config, setConfig] = useState<ServerConfig>(stdioConfigTemplate);

  const exampleTemplates: Record<string, ServerConfig> = {
    "brave-search": configTemplate,
  };

  // Initialize server data
  useEffect(() => {
    if (isOpen && selectedClient) {
      const template = exampleTemplates[selectedClient];
      if (template) {
        setServerName(selectedClient);
        setConfig(template);
      }
    }
  }, [isOpen, selectedClient]);

  // Update config template when server type changes
  useEffect(() => {
    if (serverType === "stdio") {
      setConfig((prev) => {
        const newConfig: StdioServerConfig = {
          type: "stdio",
          command: "command" in prev ? prev.command : "",
          args: "args" in prev ? prev.args : [],
          env: "env" in prev ? prev.env : {},
        };
        return newConfig;
      });
    } else {
      setConfig((prev) => {
        const newConfig: SseConfig = {
          type: serverType as "http" | "sse",
          url: "url" in prev ? prev.url : "http://localhost:8000/sse",
          headers: "headers" in prev ? prev.headers : {},
        };
        return newConfig;
      });
    }
  }, [serverType]);

  const handleArgsChange = (value: string) => {
    const newArgs = value.split(" ").filter((arg) => arg !== "");
    if (
      "args" in config &&
      JSON.stringify(newArgs) !== JSON.stringify(config.args)
    ) {
      setConfig({ ...config, args: newArgs });
    }
  };

  const handleCommandChange = (value: string) => {
    if ("command" in config) {
      setConfig({ ...config, command: value });
    }
  };

  const handleUrl = (value: string) => {
    if ("url" in config) {
      setConfig({ ...config, url: value });
    }
  };

  const handleEnvChange = (key: string, value: string) => {
    if ("env" in config && config.env) {
      setConfig({ ...config, env: { ...config.env, [key]: value } });
    }
  };

  const handletHeaderChange = (key: string, value: string) => {
    if ("headers" in config && config.headers) {
      setConfig({ ...config, headers: { ...config.headers, [key]: value } });
    }
  };

  return {
    serverName,
    setServerName,
    serverType,
    setServerType,
    config,
    setConfig,
    handleArgsChange,
    handleCommandChange,
    handleUrl,
    handleEnvChange,
    handletHeaderChange,
    envValues,
    setEnvValues,
    headerValues,
    setHeaderValues,
  };
};
