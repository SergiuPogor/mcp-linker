import { SseConfig, StdioServerConfig } from "@/types";

export function ServerDetails({
  config,
}: {
  config: SseConfig | StdioServerConfig;
}) {
  if ("command" in config) {
    return (
      <div className="flex flex-col">
        <span className="font-medium">Command:</span>
        <span className="text-muted-foreground break-words">
          {config.command}
        </span>
      </div>
    );
  } else if ("url" in config) {
    return (
      <div className="flex flex-col">
        <span className="font-medium">URL:</span>
        <span className="text-muted-foreground break-words">
          {config.url}
        </span>
        <span className="font-medium mt-1">Type:</span>
        <span className="text-muted-foreground break-words">
          {config.type}
        </span>
      </div>
    );
  }
  return null;
}
