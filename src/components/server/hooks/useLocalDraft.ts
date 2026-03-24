// useLocalDraft.ts
import type { ServerConfig } from "@/types";
import { useEffect, useState } from "react";

export const LOCAL_STORAGE_KEY = "server_config_dialog_draft";

interface LocalDraftData {
  serverName: string;
  config: ServerConfig | null;
  envValues: Record<string, string>;
}

interface LocalDraftProps {
  serverName: string;
  setServerName: (name: string) => void;
  config: ServerConfig | null;
  setConfig: (config: ServerConfig | null) => void;
  envValues: Record<string, string>;
  setEnvValues: (values: Record<string, string>) => void;
  isOpen: boolean;
}

export function useLocalDraft() {
  const [draftProps, setDraftProps] = useState<LocalDraftProps | null>(null);

  // Load saved draft when dialog opens
  useEffect(() => {
    if (draftProps?.isOpen) {
      const { setServerName, setConfig, setEnvValues } = draftProps;

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
  }, [draftProps?.isOpen]);

  // Save draft to localStorage on changes
  useEffect(() => {
    if (draftProps?.serverName && draftProps?.config) {
      const { serverName, config, envValues } = draftProps;
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ serverName, config, envValues }),
      );
    }
  }, [draftProps?.serverName, draftProps?.config, draftProps?.envValues]);

  // Function to clear saved draft
  const clearDraft = (props?: LocalDraftProps) => {
    if (props) {
      setDraftProps(props);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return { clearDraft, draftProps };
}
