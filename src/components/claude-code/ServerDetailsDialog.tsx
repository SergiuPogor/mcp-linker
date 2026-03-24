import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Globe, Settings, Terminal } from "lucide-react";

interface Server {
  name: string;
  type: string;
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, any>;
}

interface ServerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: Server | null;
}

export default function ServerDetailsDialog({ open, onOpenChange, server }: ServerDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Server Details: {server?.name}</DialogTitle>
          <DialogDescription>
            Detailed information about the MCP server configuration
          </DialogDescription>
        </DialogHeader>
        
        {server && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="mt-1 text-sm">{server.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Type</Label>
                <div className="mt-1 flex items-center gap-1">
                  {getServerTypeIcon(server.type)}
                  <span className="text-sm">{server.type.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3 text-gray-500" />
                    Configured
                  </Badge>
                </div>
              </div>
            </div>
            
            {server.url && (
              <div>
                <Label className="text-sm font-medium">URL</Label>
                <p className="mt-1 text-sm break-all bg-muted p-2 rounded font-mono">
                  {server.url}
                </p>
              </div>
            )}
            
            {server.command && (
              <div>
                <Label className="text-sm font-medium">Command</Label>
                <p className="mt-1 text-sm font-mono bg-muted p-2 rounded">
                  {server.command}
                  {server.args && server.args.length > 0 && 
                    ` ${server.args.join(" ")}`
                  }
                </p>
              </div>
            )}

            {server.env && Object.keys(server.env).length > 0 && (
              <div>
                <Label className="text-sm font-medium">Environment Variables</Label>
                <div className="mt-1 bg-muted p-2 rounded">
                  {Object.entries(server.env).map(([key, value]) => (
                    <div key={key} className="text-sm font-mono">
                      {key}={String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}