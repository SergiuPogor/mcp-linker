// useLocalDraft.ts
import type { ServerConfig } from "@/types";
import { useEffect } from "react";

export const LOCAL_STORAGE_KEY = "server_config_dialog_draft";

interface LocalDraftData {
  serverName: string;
  config: ServerConfig | null;
  envValues: Record<string, string>;
}

interface UseLocalDraftParams {
  isOpen: boolean;
  serverName: string;
  setServerName: (name: string) => void;
  config: ServerConfig | null;
  setConfig: (config: ServerConfig | null) => void;
  envValues: Record<string, string>;
  setEnvValues: (values: Record<string, string>) => void;
}

export function useLocalDraft({
  isOpen,
  serverName,
  setServerName,
  config,
  setConfig,
  envValues,
  setEnvValues,
}: UseLocalDraftParams) {
  // Load saved draft when dialog opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as LocalDraftData;
          if (parsed.serverName) setServerName(parsed.serverName);
          if (parsed.config) setConfig(parsed.config);
          if (parsed.envValues) setEnvValues(parsed.envValues);
        } catch {
          // ignore parse errors
        }
      }
    }
  }, [isOpen, setServerName, setConfig, setEnvValues]);

  // Save draft to localStorage on changes
  useEffect(() => {
    if (serverName && config) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ serverName, config, envValues }),
      );
    }
  }, [serverName, config, envValues]);

  // Function to clear saved draft
  const clearDraft = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return { clearDraft };
}
