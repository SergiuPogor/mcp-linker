import { ServerConfig } from "./index";

export type ConfigType = {
  mcpServers: {
    [key: string]: ServerConfig;
  };
};
