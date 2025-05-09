// Type for SSE/HTTP server
export type SseConfig = {
  type: "http" | "sse";
  url: string;
  headers?: Record<string, any>;
};

// Type for stdio server
export type StdioServerConfig = {
  command: string;
  args: string[];
  env?: Record<string, any>;
};

// Union type for all server config types
export type ServerConfig = SseConfig | StdioServerConfig;

export type ServerType = {
  id?: string;
  name: string;
  developer?: string;
  icon_url?: string;
  description: string;
  category?: string;
  source: string;
  server_id: string;
  is_official?: boolean;
  is_hot?: boolean;
  is_featured?: boolean;
  hasViewed?: boolean;
};

export interface Category {
  id: string;
  name: string;
  icon: JSX.Element;
  content: string;
}
