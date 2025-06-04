import { Terminal } from "lucide-react";

interface CommandDisplayProps {
  config: {
    command?: string;
    args?: string[];
    url?: string;
  };
}

export function CommandDisplay({ config }: CommandDisplayProps) {
  // Helper function to format command display
  const formatCommand = (config: any) => {
    if ("command" in config) {
      const fullCommand =
        config.args && config.args.length > 0
          ? `${config.command} ${config.args.join(" ")}`
          : config.command;
      return fullCommand.length > 50
        ? `${fullCommand.substring(0, 50)}...`
        : fullCommand;
    }
    if ("url" in config) {
      return config.url;
    }
    return "N/A";
  };

  const isStdio = "command" in config;
  const command = formatCommand(config);

  return (
    <div className="flex items-center gap-2 max-w-xs">
      {isStdio ? (
        <Terminal className="h-4 w-4 text-blue-500 flex-shrink-0" />
      ) : (
        <div className="h-4 w-4 rounded-full bg-orange-500 flex-shrink-0" />
      )}
      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate">
        {command}
      </code>
    </div>
  );
}
