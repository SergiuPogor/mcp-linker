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
import { Download, RefreshCw, Upload } from "lucide-react";
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
  onCloudDownload: (overrideAll: boolean) => Promise<void>;
  isSyncing: boolean;
  cloudSyncStatus?: CloudSyncStatus;
  servers: ServerTableData[];
  onCloudDownloadSuccess: () => Promise<void>;
}

export function CloudSyncDialog({
  open,
  onOpenChange,
  onCloudUpload,
  onCloudDownload,
  isSyncing,
  cloudSyncStatus,
  servers,
  onCloudDownloadSuccess,
}: CloudSyncDialogProps) {
  const [cloudOverrideMode, setCloudOverrideMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleCloudDownload = async () => {
    setIsDownloading(true);
    try {
      await onCloudDownload(cloudOverrideMode);
      // toast.success("Configurations downloaded from cloud successfully.");
      onCloudDownloadSuccess();
    } catch (error) {
      console.error("Cloud download failed:", error);
      toast.error(
        `Cloud download failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsDownloading(false);
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
      <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Cloud Sync Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Local Configurations:
              </span>
              <Badge variant="secondary">{localServersCount} servers</Badge>
            </div>

            {cloudSyncStatus && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Cloud Configurations:
                  </span>
                  <Badge variant="secondary">
                    {cloudSyncStatus.total} servers
                  </Badge>
                </div>

                {cloudSyncStatus.lastSync && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Last Sync:
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
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
              className="text-sm font-medium text-gray-900 dark:text-gray-100"
            >
              Override mode (replace all configurations)
            </label>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {cloudOverrideMode
              ? "This will completely replace all configurations on the target."
              : "This will merge configurations, keeping existing ones and adding new ones."}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleCloudUpload}
              disabled={isUploading || isDownloading || localServersCount === 0}
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isUploading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload to Cloud
            </Button>

            <Button
              variant="outline"
              onClick={handleCloudDownload}
              disabled={
                isDownloading || isUploading || cloudSyncStatus?.total === 0
              }
              className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isDownloading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download from Cloud
            </Button>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isUploading || isDownloading}
              className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
