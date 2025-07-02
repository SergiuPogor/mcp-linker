import { ServerConfig, SseConfig } from "@/types";
import React from "react";
import { LabeledInput } from "../../shared/LabeledInput";
import { ConfigTabs } from "../config";
import { ServerConfigDialogFooter } from "../dialog/ServerConfigDialogFooter";
import { SseConfigForm } from "./SseConfigForm";
import { StdioConfigForm } from "./StdioConfigForm";

interface ServerConfigFormProps {
  serverName: string;
  setServerName: (name: string) => void;
  configs: ServerConfig[];
  curIndex: number;
  onConfigChange: (c: ServerConfig, index: number) => void;
  config: ServerConfig;
  envValues: Record<string, string>;
  setEnvValues: (env: Record<string, string>) => void;
  onCommandChange: (value: string) => void;
  onArgsChange: (value: string) => void;
  onEnvChange: (key: string, value: string) => void;
  onSseConfigChange: (newConfig: SseConfig) => void;
  onSubmit: () => Promise<void>;
  selectedClient: string;
  onSubmitTeamLocal?: () => Promise<void>;
}

export const ServerConfigForm: React.FC<ServerConfigFormProps> = ({
  serverName,
  setServerName,
  configs,
  curIndex,
  onConfigChange,
  config,
  envValues,
  setEnvValues,
  onCommandChange,
  onArgsChange,
  onEnvChange,
  onSseConfigChange,
  onSubmit,
  selectedClient,
  onSubmitTeamLocal,
}) => {
  return (
    <>
      <LabeledInput
        label="Server name"
        value={serverName}
        onChange={setServerName}
      />

      {configs && configs.length > 0 && (
        <ConfigTabs
          configs={configs}
          curIndex={curIndex}
          onConfigChange={onConfigChange}
        />
      )}

      <div className="grid gap-4 py-4">
        {/* StdioServerConfig specific fields */}
        {config && "command" in config && (
          <StdioConfigForm
            config={config}
            envValues={envValues}
            setEnvValues={setEnvValues}
            onCommandChange={onCommandChange}
            onArgsChange={onArgsChange}
            onEnvChange={onEnvChange}
          />
        )}

        {/* SseConfig specific fields */}
        {config && "url" in config && (
          <SseConfigForm config={config} onConfigChange={onSseConfigChange} />
        )}
      </div>

      <ServerConfigDialogFooter
        onSubmit={onSubmit}
        selectedClient={selectedClient}
        onSubmitTeamLocal={onSubmitTeamLocal}
      />
    </>
  );
};
