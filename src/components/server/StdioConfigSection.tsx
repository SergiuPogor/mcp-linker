import { Button } from "@/components/ui/button";
import { CommandInput } from "./CommandInput";
import { ArgsTextarea } from "./ArgsTextarea";
import { EnvEditor } from "./EnvEditor";
import type { ServerConfig } from "@/types";

interface StdioConfigSectionProps {
  config: ServerConfig;
  handleArgsChange: (value: string) => void;
  handleCommandChange: (value: string) => void;
  handleEnvChange: (key: string, value: string) => void;
  envValues: Record<string, string>;
  setEnvValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const StdioConfigSection = ({
  config,
  handleArgsChange,
  handleCommandChange,
  handleEnvChange,
  envValues,
  setEnvValues,
}: StdioConfigSectionProps) => {
  const commands = ["uvx", "bunx", "npx", "docker", "python", "node"];

  return (
    <div>
      <CommandInput
        command={"command" in config ? config.command : ""}
        onChange={handleCommandChange}
      />

      <div className="flex gap-2 flex-wrap">
        {commands.map((command) => (
          <Button
            key={command}
            variant="outline"
            onClick={() => handleCommandChange(command)}
          >
            {command}
          </Button>
        ))}
      </div>

      <ArgsTextarea
        args={"args" in config ? config.args : []}
        onChange={handleArgsChange}
      />

      <EnvEditor
        env={"env" in config ? config.env || {} : {}}
        envValues={envValues}
        setEnvValues={setEnvValues}
        onEnvChange={handleEnvChange}
        isEdit={true}
      />
    </div>
  );
};
