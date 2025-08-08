import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Eye, RefreshCcw, Settings, Terminal, Globe, AlertCircle, CheckCircle2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "@/hooks/use-toast";
import { useClientPathStore } from "@/stores/clientPathStore";

interface ClaudeCodeServer {
  name: string;
  server_type: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  status: string;
}

interface AddServerRequest {
  name: string;
  server_type: string;
  url?: string;
  command?: string;
  args?: string;
}

interface ServerFormData {
  name: string;
  server_type: "http" | "sse" | "stdio";
  url: string;
  command: string;
  args: string;
}

export default function ClaudeCodeManage() {
  const { toast } = useToast();
  const { selectedPath } = useClientPathStore();
  const [servers, setServers] = useState<ClaudeCodeServer[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<ClaudeCodeServer | null>(null);
  const [claudeCliAvailable, setClaudeCliAvailable] = useState(false);
  const [formData, setFormData] = useState<ServerFormData>({
    name: "",
    server_type: "http",
    url: "",
    command: "",
    args: ""
  });

  // Check if Claude CLI is available
  const checkClaudeCliAvailability = async () => {
    try {
      const available = await invoke<boolean>("check_claude_cli_available");
      setClaudeCliAvailable(available);
      if (!available) {
        toast({
          title: "Claude CLI Not Found",
          description: "Claude Code CLI is not installed or not in PATH",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error checking Claude CLI:", error);
      setClaudeCliAvailable(false);
    }
  };

  // Load MCP servers from Claude Code CLI
  const loadServers = async () => {
    if (!claudeCliAvailable) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const serverList = await invoke<ClaudeCodeServer[]>("claude_mcp_list", { 
        workingDir: selectedPath 
      });
      setServers(serverList);
    } catch (error) {
      console.error("Error loading servers:", error);
      toast({
        title: "Error loading servers",
        description: `Failed to fetch MCP servers: ${error}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add server using Claude Code CLI
  const addServer = async () => {
    try {
      const { name, server_type, url, command, args } = formData;
      
      if (!name.trim()) {
        toast({
          title: "Validation Error",
          description: "Server name is required",
          variant: "destructive"
        });
        return;
      }

      const request: AddServerRequest = {
        name: name.trim(),
        server_type
      };

      if (server_type === "http" || server_type === "sse") {
        if (!url.trim()) {
          toast({
            title: "Validation Error",
            description: "URL is required for HTTP/SSE servers",
            variant: "destructive"
          });
          return;
        }
        request.url = url.trim();
      } else if (server_type === "stdio") {
        if (!command.trim()) {
          toast({
            title: "Validation Error",
            description: "Command is required for stdio servers",
            variant: "destructive"
          });
          return;
        }
        request.command = command.trim();
        if (args.trim()) {
          request.args = args.trim();
        }
      }

      const response = await invoke<{success: boolean, message: string}>("claude_mcp_add", { 
        request, 
        workingDir: selectedPath 
      });
      
      if (response.success) {
        toast({
          title: "Server Added",
          description: response.message,
        });
        setAddDialogOpen(false);
        setFormData({
          name: "",
          server_type: "http",
          url: "",
          command: "",
          args: ""
        });
        await loadServers(); // Reload servers
      } else {
        toast({
          title: "Error adding server",
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error adding server:", error);
      toast({
        title: "Error adding server",
        description: `Failed to add server: ${error}`,
        variant: "destructive"
      });
    }
  };

  // Remove server using Claude Code CLI
  const removeServer = async (serverName: string) => {
    try {
      const response = await invoke<{success: boolean, message: string}>("claude_mcp_remove", { 
        name: serverName,
        workingDir: selectedPath
      });
      
      if (response.success) {
        toast({
          title: "Server Removed",
          description: response.message,
        });
        await loadServers(); // Reload servers
      } else {
        toast({
          title: "Error removing server",
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error removing server:", error);
      toast({
        title: "Error removing server",
        description: `Failed to remove server: ${error}`,
        variant: "destructive"
      });
    }
  };

  // Get server details using Claude Code CLI
  const getServerDetails = async (serverName: string) => {
    try {
      const server = await invoke<ClaudeCodeServer>("claude_mcp_get", { 
        name: serverName,
        workingDir: selectedPath
      });
      setSelectedServer(server);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error getting server details:", error);
      toast({
        title: "Error getting server details",
        description: `Failed to fetch server details: ${error}`,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Active", icon: CheckCircle2, color: "text-green-500" },
      inactive: { variant: "secondary" as const, label: "Inactive", icon: AlertCircle, color: "text-gray-500" },
      needs_auth: { variant: "destructive" as const, label: "Needs Authentication", icon: AlertCircle, color: "text-yellow-500" },
      error: { variant: "destructive" as const, label: "Error", icon: AlertCircle, color: "text-red-500" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const getServerTypeIcon = (serverType: string) => {
    switch (serverType) {
      case "http":
      case "sse":
        return <Globe className="h-4 w-4" />;
      case "stdio":
        return <Terminal className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    checkClaudeCliAvailability();
  }, []);

  useEffect(() => {
    if (claudeCliAvailable) {
      loadServers();
    }
  }, [claudeCliAvailable, selectedPath]);

  if (!claudeCliAvailable) {
    return (
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Claude Code CLI Not Available</h1>
            <p className="text-muted-foreground mb-6">
              The Claude Code CLI is not installed or not accessible. Please install it to use this feature.
            </p>
            <Button onClick={checkClaudeCliAvailability} className="mr-2">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPath) {
    return (
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Working Directory Selected</h1>
            <p className="text-muted-foreground mb-6">
              Please select a working directory in the Settings page to manage Claude Code MCP servers for that project.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Claude Code MCP Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage MCP servers for Claude Code CLI client
            </p>
            {selectedPath && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Working Directory:</span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {selectedPath}
                </code>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={loadServers}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Server
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add MCP Server</DialogTitle>
                  <DialogDescription>
                    Add a new MCP server to your Claude Code configuration
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Server Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., sentry"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type">Server Type</Label>
                    <Select
                      value={formData.server_type}
                      onValueChange={(value: "http" | "sse" | "stdio") => 
                        setFormData(prev => ({ ...prev, server_type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="http">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            HTTP
                          </div>
                        </SelectItem>
                        <SelectItem value="sse">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            SSE (Server-Sent Events)
                          </div>
                        </SelectItem>
                        <SelectItem value="stdio">
                          <div className="flex items-center gap-2">
                            <Terminal className="h-4 w-4" />
                            Stdio
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.server_type === "http" || formData.server_type === "sse") && (
                    <div className="grid gap-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com/mcp"
                        value={formData.url}
                        onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>
                  )}

                  {formData.server_type === "stdio" && (
                    <>
                      <div className="grid gap-2">
                        <Label htmlFor="command">Command</Label>
                        <Input
                          id="command"
                          placeholder="python -m my_mcp_server"
                          value={formData.command}
                          onChange={(e) => setFormData(prev => ({ ...prev, command: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="args">Arguments (optional)</Label>
                        <Input
                          id="args"
                          placeholder="--port 8000 --debug"
                          value={formData.args}
                          onChange={(e) => setFormData(prev => ({ ...prev, args: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addServer}>Add Server</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Server List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              MCP Servers
            </CardTitle>
            <CardDescription>
              Configured MCP servers for Claude Code CLI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCcw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading servers...</span>
              </div>
            ) : servers.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No MCP servers configured</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first MCP server to get started with Claude Code
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Server
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL/Command</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servers.map((server) => (
                    <TableRow key={server.name}>
                      <TableCell className="font-medium">{server.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getServerTypeIcon(server.server_type)}
                          {server.server_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {server.url || server.command || "—"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(server.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => getServerDetails(server.name)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            Details
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Server</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{server.name}" from your Claude Code configuration?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removeServer(server.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove Server
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Server Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Server Details: {selectedServer?.name}</DialogTitle>
              <DialogDescription>
                Detailed information about the MCP server configuration
              </DialogDescription>
            </DialogHeader>
            
            {selectedServer && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="mt-1 text-sm">{selectedServer.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <div className="mt-1 flex items-center gap-1">
                      {getServerTypeIcon(selectedServer.server_type)}
                      <span className="text-sm">{selectedServer.server_type.toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedServer.status)}
                    </div>
                  </div>
                </div>
                
                {selectedServer.url && (
                  <div>
                    <Label className="text-sm font-medium">URL</Label>
                    <p className="mt-1 text-sm break-all bg-muted p-2 rounded font-mono">
                      {selectedServer.url}
                    </p>
                  </div>
                )}
                
                {selectedServer.command && (
                  <div>
                    <Label className="text-sm font-medium">Command</Label>
                    <p className="mt-1 text-sm font-mono bg-muted p-2 rounded">
                      {selectedServer.command}
                      {selectedServer.args && selectedServer.args.length > 0 && 
                        ` ${selectedServer.args.join(" ")}`
                      }
                    </p>
                  </div>
                )}

                {selectedServer.env && Object.keys(selectedServer.env).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Environment Variables</Label>
                    <div className="mt-1 bg-muted p-2 rounded">
                      {Object.entries(selectedServer.env).map(([key, value]) => (
                        <div key={key} className="text-sm font-mono">
                          {key}={value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}