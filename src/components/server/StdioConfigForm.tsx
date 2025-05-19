// StdioConfigForm.tsx
import { StdioServerConfig } from "@/types";
import { ArgsTextarea } from "./ArgsTextarea";
import { CommandInput } from "./CommandInput";
import { EnvEditor } from "./EnvEditor";

interface StdioConfigFormProps {
  config: StdioServerConfig;
  envValues: Record<string, string>;
  setEnvValues: (envValues: Record<string, string>) => void;
  onCommandChange: (value: string) => void;
  onArgsChange: (value: string) => void;
  onEnvChange: (key: string, value: string) => void;
}

export const StdioConfigForm = ({
  config,
  envValues,
  setEnvValues,
  onCommandChange,
  onArgsChange,
  onEnvChange,
}: StdioConfigFormProps) => {
  return (
    <>
      <CommandInput command={config.command} onChange={onCommandChange} />
      <ArgsTextarea args={config.args} onChange={onArgsChange} />
      <EnvEditor
        env={config.env || {}}
        envValues={envValues}
        setEnvValues={setEnvValues}
        onEnvChange={onEnvChange}
        isEdit={false}
      />
    </>
  );
};
