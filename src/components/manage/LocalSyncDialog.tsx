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
import { availableClients } from "@/constants/clients";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LocalSyncDialogProps {
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

export function LocalSyncDialog({
  open,
  onOpenChange,
  onSync,
  currentClient,
  isSyncing,
}: LocalSyncDialogProps) {
  const [syncFromClient, setSyncFromClient] = useState<string>(() => {
    // Load from localStorage on initial render
    return localStorage.getItem("syncFromClient") || "";
  });
  const [syncToClient, setSyncToClient] = useState<string>(currentClient || "");
  const [overrideMode, setOverrideMode] = useState(false);

  // Effect to save syncFromClient to localStorage
  useEffect(() => {
    localStorage.setItem("syncFromClient", syncFromClient);
  }, [syncFromClient]);

  const resetState = () => {
    setSyncFromClient(localStorage.getItem("syncFromClient") || ""); // Reset to localStorage value
    setSyncToClient(currentClient || "");
    setOverrideMode(false);
  };

  useEffect(() => {
    if (open) {
      setSyncToClient(currentClient || "");
    }
  }, [open, currentClient]);

  const handleLocalSync = async () => {
    if (syncFromClient && syncToClient) {
      try {
        await onSync(syncFromClient, syncToClient, overrideMode);
        onOpenChange(false);
        resetState();
        toast.success("Local sync completed successfully.");
      } catch (error) {
        console.error("Local sync failed:", error);
        toast.error(
          `Local sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  };

  const handleCancel = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isSyncing && !open) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Local Sync Configuration</DialogTitle>
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
              disabled={isSyncing || syncFromClient === syncToClient}
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
              onClick={handleLocalSync}
              disabled={
                !syncFromClient ||
                !syncToClient ||
                syncFromClient === syncToClient ||
                isSyncing
              }
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