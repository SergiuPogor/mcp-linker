export * from "./ServerType";

// Type for SSE/HTTP server
export type SseConfig = {
  type: "http" | "sse";
  url: string;
  headers?: Record<string, any>;
  disabled?: boolean;
  isActive?: boolean;
};

// Type for stdio server
export type StdioServerConfig = {
  type: "stdio";
  command: string;
  args: string[];
  env?: Record<string, any>;
  disabled?: boolean;
  isActive?: boolean;
};

// Type for encrypted server configuration
export type EncryptedServerConfig = {
  type: "encrypted";
  data: string;
};

// Union type for all server config types
export type ServerConfig =
  | SseConfig
  | StdioServerConfig
  | EncryptedServerConfig;

// Type for server table data
export type ServerTableData = {
  id?: string;
  name: string;
} & ServerConfig;

export interface Nav {
  id: string;
  name: string;
  icon: JSX.Element;
  path?: string;
}
