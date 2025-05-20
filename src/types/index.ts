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
  id: number;
  name: string;
  developer?: string;
  icon_url?: string;
  description: string;
  category?: string;
  source: string;
  uid: string;
  isOfficial?: boolean;
  githubStars: number;
  views: number;
};

export interface Nav {
  id: string;
  name: string;
  icon: JSX.Element;
}
