import { claudeWrite } from "@/lib/claude";
import { toast } from "sonner";
import { useCCProjectStore } from "@/stores/ccProject";
import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

interface ClaudeCodeServer {
  name: string;
  type: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

interface AddServerRequest {
  name: string;
  type: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

interface ServerFormData {
  name: string;
  type: "http" | "sse" | "stdio";
  url: string;
  command: string;
  args: string;
  env?: Record<string, string>;
  headers?: Record<string, string>;
}

export function useClaudeCodeManagement() {
  const { selectedProject, selectedScope, setProjects } = useCCProjectStore();
  const [servers, setServers] = useState<ClaudeCodeServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [claudeCliAvailable, setClaudeCliAvailable] = useState(false);

  const checkClaudeCliAvailability = useCallback(async () => {
    try {
      const available = await invoke<boolean>("check_claude_config_exists");
      setClaudeCliAvailable(available);
      if (!available) {
        toast.error("~/.claude.json Not Found", { description: "~/.claude.json Not Found" });
      }
    } catch (error) {
      console.error("Error checking Claude CLI:", error);
      setClaudeCliAvailable(false);
    }
  }, []);

  const loadServers = useCallback(async () => {
    if (selectedScope !== "user" && !selectedProject) {
      setServers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const serverList = await invoke<ClaudeCodeServer[]>("claude_mcp_list", { 
        workingDir: selectedProject || "", scope: selectedScope
      });
      setServers(serverList);
    } catch (error) {
      console.error("Error loading servers:", error);
      toast.error("Error loading servers", { description: `Failed to fetch MCP servers: ${error}` });
    } finally {
      setLoading(false);
    }
  }, [selectedScope, selectedProject]);

  const addServer = async (formData: ServerFormData) => {
    try {
      const { name, type, url, command, args, env, headers } = formData;
      
      if (!name.trim()) {
        toast.error("Validation Error", { description: "Server name is required" });
        return false;
      }

      const request: AddServerRequest = {
        name: name.trim(),
        type
      };

      if (type === "http" || type === "sse") {
        if (!url.trim()) {
          toast.error("Validation Error", { description: "URL is required for HTTP/SSE servers" });
          return false;
        }
        request.url = url.trim();
      } else if (type === "stdio") {
        if (!command.trim()) {
          toast.error("Validation Error", { description: "Command is required for stdio servers" });
          return false;
        }
        request.command = command.trim();
        if (args.trim()) {
          request.args = args.trim().split(/\s+/);
        }
      }

      if (env && Object.keys(env).length > 0) {
        request.env = env;
      }

      if (headers && Object.keys(headers).length > 0) {
        request.headers = headers;
      }

      const response = await claudeWrite<{success: boolean, message: string}>("claude_mcp_add", { 
        request, 
        workingDir: selectedProject || "", scope: selectedScope
      });
      
      if (response.success) {
        toast.success("Server Added", { description: response.message });
        await loadServers();
        return true;
      } else {
        toast.error("Error adding server", { description: response.message });
        return false;
      }
    } catch (error) {
      console.error("Error adding server:", error);
      toast.error("Error adding server", { description: `Failed to add server: ${error}` });
      return false;
    }
  };

  const removeServer = async (serverName: string) => {
    try {
      const response = await claudeWrite<{success: boolean, message: string}>("claude_mcp_remove", { 
        name: serverName,
        workingDir: selectedProject || "", scope: selectedScope
      });
      
      if (response.success) {
        toast.success("Server Removed", { description: response.message });
        await loadServers();
      } else {
        toast.error("Error removing server", { description: response.message });
      }
    } catch (error) {
      console.error("Error removing server:", error);
      toast.error("Error removing server", { description: `Failed to remove server: ${error}` });
    }
  };

  const getServerDetails = async (serverName: string): Promise<ClaudeCodeServer | null> => {
    try {
      const server = await invoke<ClaudeCodeServer>("claude_mcp_get", { 
        name: serverName,
        workingDir: selectedProject || "", scope: selectedScope
      });
      return server;
    } catch (error) {
      console.error("Error getting server details:", error);
      toast.error("Error getting server details", { description: `Failed to fetch server details: ${error}` });
      return null;
    }
  };

  const listProjects = useCallback(async () => {
    const projectList = await invoke<string[]>("claude_list_projects");
    setProjects(projectList);
  }, [selectedProject]);

  return {
    servers,
    loading,
    claudeCliAvailable,
    checkClaudeCliAvailability,
    loadServers,
    addServer,
    removeServer,
    getServerDetails,
    listProjects
  };
}
