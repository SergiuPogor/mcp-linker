import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface SyncConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSync: (
    fromClient: string,
    toClient: string,
    overrideAll: boolean,
  ) => Promise<void>;
  currentClient?: string;
  isSyncing: boolean;
}

const availableClients = [
  { value: "claude", label: "Claude Desktop" },
  { value: "cursor", label: "Cursor" },
  { value: "cline", label: "Cline" },
  { value: "vscode", label: "VSCode" },
  { value: "windsurf", label: "Windsurf" },
  { value: "mcphub", label: "MCPHub" },
  { value: "mcplinker", label: "MCPLinker" },
];

export function SyncConfigDialog({
  open,
  onOpenChange,
  onSync,
  currentClient,
  isSyncing,
}: SyncConfigDialogProps) {
  const [syncFromClient, setSyncFromClient] = useState<string>("");
  const [syncToClient, setSyncToClient] = useState<string>("");
  const [overrideMode, setOverrideMode] = useState(false);

  const handleSync = async () => {
    if (syncFromClient && syncToClient) {
      try {
        await onSync(syncFromClient, syncToClient, overrideMode);
        onOpenChange(false);
        setSyncFromClient("");
        setSyncToClient("");
        setOverrideMode(false);
      } catch (error) {
        console.error("Sync failed:", error);
      }
    }
  };

  const handleCancel = () => {
    setSyncFromClient("");
    setSyncToClient("");
    setOverrideMode(false);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (!isSyncing) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sync MCP Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From Client:</label>
            <Select
              value={syncFromClient}
              onValueChange={setSyncFromClient}
              disabled={isSyncing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source client" />
              </SelectTrigger>
              <SelectContent>
                {availableClients
                  .filter((client) => client.value !== currentClient)
                  .map((client) => (
                    <SelectItem key={client.value} value={client.value}>
                      {client.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To Client:</label>
            <Select
              value={syncToClient}
              onValueChange={setSyncToClient}
              disabled={isSyncing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target client" />
              </SelectTrigger>
              <SelectContent>
                {availableClients.map((client) => (
                  <SelectItem key={client.value} value={client.value}>
                    {client.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="override-mode"
              checked={overrideMode}
              onCheckedChange={setOverrideMode}
              disabled={isSyncing}
            />
            <label htmlFor="override-mode" className="text-sm font-medium">
              Override all (replace existing configs)
            </label>
          </div>

          <div className="text-xs text-gray-600 dark:text-gray-400">
            {overrideMode
              ? "This will completely replace all MCP server configurations in the target client."
              : "This will merge configurations, keeping existing ones and adding new ones from source."}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSyncing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSync}
              disabled={!syncFromClient || !syncToClient || isSyncing}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
