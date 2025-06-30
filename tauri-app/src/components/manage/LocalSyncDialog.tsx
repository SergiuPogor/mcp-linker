import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { availableClients } from "@/constants/clients";
import { needspathClient } from "@/lib/data";
import { useClientPathStore } from "@/stores/clientPathStore";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { open as openUrl } from "@tauri-apps/plugin-shell";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LocalSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocalSync: (
    fromClient: string,
    toClient: string,
    overrideAll: boolean,
  ) => Promise<void>;
  currentClient?: string;
  isSyncing: boolean;
  userTier?: string;
}

export function LocalSyncDialog({
  open,
  onOpenChange,
  onLocalSync,
  currentClient,
  isSyncing,
  userTier,
}: LocalSyncDialogProps) {
  const [syncFromClient, setSyncFromClient] = useState<string>(() => {
    // Load from localStorage on initial render
    return localStorage.getItem("syncFromClient") || "";
  });
  const [syncToClient, setSyncToClient] = useState<string>(currentClient || "");
  const [overrideMode, setOverrideMode] = useState(false);
  const [fromPath, setFromPath] = useState<string>("");
  const [toPath, setToPath] = useState<string>("");
  const [isLoadingFromPath, setIsLoadingFromPath] = useState(false);
  const [isLoadingToPath, setIsLoadingToPath] = useState(false);

  const { getClientPath, setClientPath } = useClientPathStore();

  // Effect to save syncFromClient to localStorage
  useEffect(() => {
    localStorage.setItem("syncFromClient", syncFromClient);
  }, [syncFromClient]);

  // Load paths when clients change
  useEffect(() => {
    if (syncFromClient) {
      const path = getClientPath(syncFromClient);
      setFromPath(path || "");
    }
  }, [syncFromClient, getClientPath]);

  useEffect(() => {
    if (syncToClient) {
      const path = getClientPath(syncToClient);
      setToPath(path || "");
    }
  }, [syncToClient, getClientPath]);

  const resetState = () => {
    setSyncFromClient(localStorage.getItem("syncFromClient") || ""); // Reset to localStorage value
    setSyncToClient(currentClient || "");
    setOverrideMode(false);
    setFromPath("");
    setToPath("");
  };

  useEffect(() => {
    if (open) {
      setSyncToClient(currentClient || "");
    }
  }, [open, currentClient]);

  const handleBrowseFromPath = async () => {
    try {
      setIsLoadingFromPath(true);
      const selectedPath = await openDialog({
        directory: true,
        multiple: false,
      });

      if (selectedPath) {
        setFromPath(selectedPath);
        setClientPath(syncFromClient, selectedPath);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    } finally {
      setIsLoadingFromPath(false);
    }
  };

  const handleBrowseToPath = async () => {
    try {
      setIsLoadingToPath(true);
      const selectedPath = await openDialog({
        directory: true,
        multiple: false,
      });

      if (selectedPath) {
        setToPath(selectedPath);
        setClientPath(syncToClient, selectedPath);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    } finally {
      setIsLoadingToPath(false);
    }
  };

  const handleLocalSync = async () => {
    if (syncFromClient && syncToClient) {
      try {
        await onLocalSync(syncFromClient, syncToClient, overrideMode);
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

  const needsFromPath = needspathClient.includes(syncFromClient);
  const needsToPath = needspathClient.includes(syncToClient);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isSyncing && !open) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Local Sync Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              From Client:
            </label>
            <Select
              value={syncFromClient}
              onValueChange={setSyncFromClient}
              disabled={isSyncing}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue
                  placeholder="Select source client"
                  className="text-gray-900 dark:text-gray-100"
                />
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

            {needsFromPath && (
              <div className="flex space-x-2">
                <Input
                  value={fromPath}
                  onChange={(e) => {
                    setFromPath(e.target.value);
                    setClientPath(syncFromClient, e.target.value || null);
                  }}
                  className="flex-1"
                  placeholder="Select source path (optional)"
                />
                <Button
                  onClick={handleBrowseFromPath}
                  disabled={isLoadingFromPath}
                >
                  {isLoadingFromPath ? "Loading..." : "Browse"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              To Client:
            </label>
            <Select
              value={syncToClient}
              onValueChange={setSyncToClient}
              disabled={isSyncing || syncFromClient === syncToClient}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue
                  placeholder="Select target client"
                  className="text-gray-900 dark:text-gray-100"
                />
              </SelectTrigger>
              <SelectContent>
                {availableClients.map((client) => (
                  <SelectItem key={client.value} value={client.value}>
                    {client.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {needsToPath && (
              <div className="flex space-x-2">
                <Input
                  value={toPath}
                  onChange={(e) => {
                    setToPath(e.target.value);
                    setClientPath(syncToClient, e.target.value || null);
                  }}
                  className="flex-1"
                  placeholder="Select target path (optional)"
                />
                <Button onClick={handleBrowseToPath} disabled={isLoadingToPath}>
                  {isLoadingToPath ? "Loading..." : "Browse"}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="override-mode"
              checked={overrideMode}
              onCheckedChange={setOverrideMode}
              disabled={isSyncing}
            />
            <label
              htmlFor="override-mode"
              className="text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Override all (replace existing configs)
            </label>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {overrideMode
              ? "This will completely replace all MCP server configurations in the target client."
              : "This will merge configurations, keeping existing ones and adding new ones from source."}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSyncing}
              className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>

            <Button
              onClick={handleLocalSync}
              disabled={
                !syncFromClient ||
                !syncToClient ||
                syncFromClient === syncToClient ||
                isSyncing ||
                (userTier === "FREE" && syncToClient === "claude_code")
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

            {userTier === "FREE" && syncToClient === "claude_code" && (
              <Button
                onClick={() => openUrl("https://mcp-linker.store/pricing")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
