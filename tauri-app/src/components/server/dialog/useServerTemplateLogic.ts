import { useGithubReadmeJson } from "@/hooks/useGithubReadmeJson";
import { useClientPathStore } from "@/stores/clientPathStore";
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerConfig } from "../hooks/useServerConfig";
import { useServerTemplateSubmit } from "./useServerTemplateSubmit";

// Custom hook for ServerTemplateDialog logic
export function useServerTemplateLogic(
  isOpen: boolean,
  setIsDialogOpen: (open: boolean) => void,
) {
  const { selectedClient, selectedPath } = useClientPathStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [githubUrl, setGithubUrl] = useState("");
  const { loading, error, fetchAllJsonBlocks } = useGithubReadmeJson();

  // Server config state and handlers
  const {
    serverName,
    setServerName,
    projectUrl,
    setProjectUrl,
    projectDescription,
    setProjectDescription,
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
  } = useServerConfig(isOpen, selectedClient);

  // State for JSON textarea content
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify({ [serverName]: config }, null, 2)
  );

  // State for multiple JSON blocks from GitHub README
  // Each item: { obj: any, path: string[] }
  const [githubJsonBlocks, setGithubJsonBlocks] = useState<
    { serverName: string; obj: any }[]
  >([]);

  // Sync jsonText when config changes (e.g. tab switch, load from github)
  useEffect(() => {
    setJsonText(JSON.stringify({ [serverName]: config }, null, 2));
  }, [config]);

  // Parse and set config from JSON
  const commonParse = (parsed: any) => {
    if (parsed.mcpServers) {
      const firstServerKey = Object.keys(parsed.mcpServers)[0];
      const firstServerConfig = parsed.mcpServers[firstServerKey];
      setConfig(firstServerConfig);
      setServerName(firstServerKey);
      setEnvValues(firstServerConfig.env);
    } else {
      setConfig(parsed);
    }
  };

  // Handle paste button click
  const handlePasteJson = async () => {
    try {
      const text = await readText();
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        commonParse(parsed);
        toast.success("Config pasted from clipboard");
      } catch {
        toast.error("Clipboard content is not valid JSON");
      }
    } catch (e) {
      console.log(e)
      toast.error("Failed to read clipboard");
    }
  };

  // Handle textarea blur: try to parse and update config
  const handleJsonBlur = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setConfig(parsed);
    } catch {
      toast.error("Invalid JSON format");
    }
  };

  // Use the custom submit hook to get both handlers
  // selectedPath may be null, convert to undefined for the hook
  const { handleSubmit } = useServerTemplateSubmit({
    serverName,
    setIsDialogOpen,
    projectUrl,
    config,
    selectedCategoryId,
    projectDescription,
    serverType,
    selectedClient,
    selectedPath: selectedPath || undefined,
  });

  // Find all server config objects with 'command' or 'url' under mcpServers (max 3 levels)
  function findCommandOrUrlObjectsSimple(obj: any): { serverName: string; obj: any }[] {
    const results: { serverName: string; obj: any }[] = [];
    if (obj && typeof obj === "object" && obj.mcpServers && typeof obj.mcpServers === "object") {
      for (const serverName of Object.keys(obj.mcpServers)) {
        const serverConfig = obj.mcpServers[serverName];
        if (
          serverConfig &&
          typeof serverConfig === "object" &&
          ("command" in serverConfig || "url" in serverConfig)
        ) {
          results.push({ serverName, obj: serverConfig });
        }
      }
    } else if (obj && typeof obj === "object" && ("command" in obj || "url" in obj)) {
      // Fallback: root object is already a server config
      results.push({ serverName: "", obj });
    }
    return results;
  }

  // Handler for loading config from GitHub (multiple blocks)
  const handleLoadFromGithub = async () => {
    const blocks = await fetchAllJsonBlocks(githubUrl);
    if (blocks && blocks.length > 0) {
      let found: { serverName: string; obj: any }[] = [];
      for (let i = 0; i < blocks.length; ++i) {
        found = found.concat(
          findCommandOrUrlObjectsSimple(blocks[i])
        );
      }
      console.log("found", found)
      setGithubJsonBlocks(found);
      if (found.length > 0) {
        toast.success(`Loaded ${found.length} config object(s) from README`);
      } else {
        toast.error("No valid config objects with 'command' or 'url' found");
      }
    } else if (error) {
      toast.error(error);
    } else {
      toast.error("No JSON blocks found in README");
    }
  };

  // Expose all state and handlers needed by UI
  return {
    selectedClient,
    selectedPath,
    selectedCategoryId,
    setSelectedCategoryId,
    githubUrl,
    setGithubUrl,
    loading,
    error,
    fetchAllJsonBlocks,
    serverName,
    setServerName,
    projectUrl,
    setProjectUrl,
    projectDescription,
    setProjectDescription,
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
    jsonText,
    setJsonText,
    githubJsonBlocks,
    setGithubJsonBlocks,
    handlePasteJson,
    handleJsonBlur,
    handleSubmit,
    handleLoadFromGithub,
    setIsDialogOpen,
  };
}
