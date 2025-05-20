import type { ServerConfig } from "@/types";
import { LabeledInput } from "../../shared/LabeledInput";
import { SellInfoSection } from "../SellInfoSection";
import { ServerTypeSelector } from "../ServerTypeSelector";
import { StdioConfigSection } from "../StdioConfigSection";
import { NetworkConfigSection } from "./NetworkConfigSection";

interface ServerTemplateFormProps {
  serverName: string;
  setServerName: (value: string) => void;
  serverType: string;
  setServerType: (value: string) => void;
  config: ServerConfig;
  isSell: boolean;
  projectDescription: string;
  setProjectDescription: (value: string) => void;
  projectUrl: string;
  setProjectUrl: (value: string) => void;
  handleArgsChange: (value: string) => void;
  handleCommandChange: (value: string) => void;
  handleUrl: (value: string) => void;
  handleEnvChange: (key: string, value: string) => void;
  handletHeaderChange: (key: string, value: string) => void;
  envValues: Record<string, string>;
  setEnvValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  headerValues: Record<string, string>;
  setHeaderValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const ServerTemplateForm = ({
  serverName,
  setServerName,
  serverType,
  setServerType,
  config,
  isSell,
  projectDescription,
  setProjectDescription,
  projectUrl,
  setProjectUrl,
  handleArgsChange,
  handleCommandChange,
  handleUrl,
  handleEnvChange,
  handletHeaderChange,
  envValues,
  setEnvValues,
  headerValues,
  setHeaderValues,
}: ServerTemplateFormProps) => {
  return (
    <div>
      <LabeledInput
        label="Server Name"
        value={serverName}
        onChange={setServerName}
      />

      {isSell && (
        <SellInfoSection
          projectDescription={projectDescription}
          setProjectDescription={setProjectDescription}
          projectUrl={projectUrl}
          setProjectUrl={setProjectUrl}
        />
      )}

      <ServerTypeSelector
        serverType={serverType}
        setServerType={setServerType}
      />

      {serverType === "stdio" ? (
        <StdioConfigSection
          config={config}
          handleArgsChange={handleArgsChange}
          handleCommandChange={handleCommandChange}
          handleEnvChange={handleEnvChange}
          envValues={envValues}
          setEnvValues={setEnvValues}
        />
      ) : (
        <NetworkConfigSection
          config={config}
          handleUrl={handleUrl}
          handletHeaderChange={handletHeaderChange}
          headerValues={headerValues}
          setHeaderValues={setHeaderValues}
        />
      )}
    </div>
  );
};
