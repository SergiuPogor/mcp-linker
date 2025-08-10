import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Plus, Terminal } from "lucide-react";
import { useState } from "react";

interface ServerFormData {
  name: string;
  type: "http" | "sse" | "stdio";
  url: string;
  command: string;
  args: string;
}

interface AddServerDialogProps {
  onAddServer: (formData: ServerFormData) => Promise<boolean>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddServerDialog({ onAddServer, open: controlledOpen, onOpenChange }: AddServerDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const [formData, setFormData] = useState<ServerFormData>({
    name: "",
    type: "http",
    url: "",
    command: "",
    args: ""
  });

  const handleAddServer = async () => {
    const success = await onAddServer(formData);
    if (success) {
      setOpen(false);
      setFormData({
        name: "",
        type: "http",
        url: "",
        command: "",
        args: ""
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              value={formData.type}
              onValueChange={(value: "http" | "sse" | "stdio") => 
                setFormData(prev => ({ ...prev, type: value }))
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

          {(formData.type === "http" || formData.type === "sse") && (
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

          {formData.type === "stdio" && (
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddServer}>Add Server</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}