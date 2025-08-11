import AddServerDialog from "@/components/claude-code/AddServerDialog";
import PreConfiguredServersDialog from "@/components/claude-code/PreConfiguredServersDialog";
import ServerDetailsDialog from "@/components/claude-code/ServerDetailsDialog";
import ServerTable from "@/components/claude-code/ServerTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClaudeCodeManagement } from "@/hooks/useClaudeCodeManagement";
import { useCCProjectStore } from "@/stores/ccProject";
import { AlertCircle, Globe, RefreshCcw, Settings } from "lucide-react";
import { useEffect, useState } from "react";

export default function ClaudeCodeManage() {
  const {
    servers,
    loading,
    claudeCliAvailable,
    checkClaudeCliAvailability,
    loadServers,
    addServer,
    removeServer,
    getServerDetails,
    listProjects
  } = useClaudeCodeManagement();

  const { projects, selectedProject, setSelectedProject } = useCCProjectStore();

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [addServerDialogOpen, setAddServerDialogOpen] = useState(false);

  const handleAddServer = async (formData: any) => {
    const result = await addServer(formData);
    if (result) {
      setAddServerDialogOpen(false);
    }
    return result;
  };

  const handleAddServerFromTable = () => {
    setAddServerDialogOpen(true);
  };

  const handleGetServerDetails = async (serverName: string) => {
    const server = await getServerDetails(serverName);
    if (server) {
      setSelectedServer(server);
      setDetailsDialogOpen(true);
    }
  };

  useEffect(() => {
    checkClaudeCliAvailability();
  }, [checkClaudeCliAvailability]);

  useEffect(() => {
    if (claudeCliAvailable) {
      loadServers();
      listProjects();
    }
  }, [claudeCliAvailable, selectedProject, loadServers, listProjects]);

  if (!claudeCliAvailable) {
    return (
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2"> Not Available</h1>
            <p className="text-muted-foreground mb-6">
              ~/.claude.json not found, The Claude Code CLI is not installed or not accessible. Please install it to use this feature.
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

  if (!selectedProject && projects.length === 0) {
    return (
      <div className="p-6 bg-background text-foreground min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Projects Found</h1>
            <p className="text-muted-foreground mb-6">
              No Claude Code projects found. Please create a project first.
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
            <p>(backup at ~/.claude.json.backup.timestamp)</p>

            <div className="mt-2 flex">
              <Label className="text-sm font-medium">Working Directory:</Label>
              <Select
                value={selectedProject || undefined}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                  <SelectItem key={project} value={project}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {project}
                    </div>
                  </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <PreConfiguredServersDialog onAddServer={handleAddServer} />
            <AddServerDialog 
              onAddServer={handleAddServer}
              open={addServerDialogOpen}
              onOpenChange={setAddServerDialogOpen}
            />
          </div>
        </div>

        <ServerTable
          servers={servers}
          loading={loading}
          onRefresh={loadServers}
          onViewDetails={handleGetServerDetails}
          onRemoveServer={removeServer}
          onAddServer={handleAddServerFromTable}
        />

        <ServerDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          server={selectedServer}
        />
      </div>
    </div>
  );
}