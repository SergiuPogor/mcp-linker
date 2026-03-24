import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ServerTableData } from "@/types";
import { RefreshCw, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CloudSyncStatus {
  total: number;
  lastSync: string | null;
  hasChanges: boolean;
}

interface CloudSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloudUpload: (overrideAll: boolean) => Promise<void>;
  isSyncing: boolean;
  cloudSyncStatus?: CloudSyncStatus;
  servers: ServerTableData[];
  onCloudDownloadSuccess: () => Promise<void>;
}

export function TeamCloudSyncDialog({
  open,
  onOpenChange,
  onCloudUpload,
  isSyncing,
  cloudSyncStatus,
  servers,
}: CloudSyncDialogProps) {
  const [cloudOverrideMode, setCloudOverrideMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const resetState = () => {
    setCloudOverrideMode(false);
  };

  const handleCloudUpload = async () => {
    setIsUploading(true);
    try {
      await onCloudUpload(cloudOverrideMode);
      toast.success("Configurations uploaded to cloud successfully.");
    } catch (error) {
      console.error("Cloud upload failed:", error);
      toast.error(
        `Cloud upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    resetState();
    onOpenChange(false);
  };

  const localServersCount = servers?.length ?? 0;

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
          <DialogTitle>Team Cloud Sync Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Local Configurations:
              </span>
              <Badge variant="secondary">{localServersCount} servers</Badge>
            </div>

            {cloudSyncStatus && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Cloud Configurations:
                  </span>
                  <Badge variant="secondary">
                    {cloudSyncStatus.total} servers
                  </Badge>
                </div>

                {cloudSyncStatus.lastSync && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Last Sync:
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(cloudSyncStatus.lastSync).toLocaleString()}
                    </span>
                  </div>
                )}

                {cloudSyncStatus.hasChanges && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-300 dark:text-orange-400 dark:border-orange-500"
                  >
                    Changes detected
                  </Badge>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="cloud-override-mode"
              checked={cloudOverrideMode}
              onCheckedChange={setCloudOverrideMode}
              disabled={isSyncing}
            />
            <label
              htmlFor="cloud-override-mode"
              className="text-sm font-medium text-foreground"
            >
              Override mode (replace all configurations)
            </label>
          </div>

          <div className="text-xs text-muted-foreground">
            {cloudOverrideMode
              ? "This will completely replace all configurations on the target."
              : "This will merge configurations, keeping existing ones and adding new ones."}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {localServersCount === 0 && (
              <div className="text-sm text-yellow-600 font-semibold col-span-2 text-center">
                No local server configurations found. Please add at least one
                server before uploading to cloud.
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleCloudUpload}
              disabled={isUploading || localServersCount === 0}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload to Cloud
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
