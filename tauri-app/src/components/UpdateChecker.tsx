import { check, Update } from "@tauri-apps/plugin-updater";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface UpdateState {
  available: boolean;
  update?: Update;
  downloading: boolean;
  progress: number;
  error?: string;
}

const STORAGE_KEYS = {
  SKIPPED_VERSIONS: 'mcp-linker-skipped-versions',
  LAST_CHECK_TIME: 'mcp-linker-last-update-check',
  REMIND_LATER_TIME: 'mcp-linker-remind-later'
};

const CHECK_INTERVAL_HOURS = 24; // Check for updates every 24 hours
const REMIND_LATER_HOURS = 24; // Remind later interval 24 hours

export function UpdateChecker() {
  const [updateState, setUpdateState] = useState<UpdateState>({
    available: false,
    downloading: false,
    progress: 0,
  });
  const [showDialog, setShowDialog] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Get list of skipped versions
  const getSkippedVersions = (): string[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SKIPPED_VERSIONS);
    return stored ? JSON.parse(stored) : [];
  };

  // Add version to skip list
  const skipVersion = (version: string) => {
    const skippedVersions = getSkippedVersions();
    if (!skippedVersions.includes(version)) {
      skippedVersions.push(version);
      localStorage.setItem(STORAGE_KEYS.SKIPPED_VERSIONS, JSON.stringify(skippedVersions));
    }
  };

  // Check if update dialog should be shown
  const shouldShowUpdateDialog = (version: string): boolean => {
    // Check if version is in skip list
    const skippedVersions = getSkippedVersions();
    if (skippedVersions.includes(version)) {
      return false;
    }

    // Check remind later time
    const remindLaterTime = localStorage.getItem(STORAGE_KEYS.REMIND_LATER_TIME);
    if (remindLaterTime) {
      const remindTime = new Date(remindLaterTime);
      const now = new Date();
      if (now < remindTime) {
        return false;
      }
    }

    return true;
  };

  // Check update frequency control
  const shouldCheckForUpdates = (): boolean => {
    const lastCheckTime = localStorage.getItem(STORAGE_KEYS.LAST_CHECK_TIME);
    if (!lastCheckTime) return true;

    const lastCheck = new Date(lastCheckTime);
    const now = new Date();
    const timeDiff = now.getTime() - lastCheck.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    return hoursDiff >= CHECK_INTERVAL_HOURS;
  };

  const checkForUpdates = async () => {
    if (!shouldCheckForUpdates()) {
      return;
    }

    try {
      const update = await check();
      localStorage.setItem(STORAGE_KEYS.LAST_CHECK_TIME, new Date().toISOString());
      
      if (update?.available && update.version && shouldShowUpdateDialog(update.version)) {
        setUpdateState(prev => ({
          ...prev,
          available: true,
          update,
        }));
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
      setUpdateState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  };

  const downloadAndInstall = async () => {
    if (!updateState.update) return;

    setShowDialog(false);
    setShowProgress(true);
    setUpdateState(prev => ({
      ...prev,
      downloading: true,
      progress: 0,
    }));

    try {
      await updateState.update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            setUpdateState(prev => ({ ...prev, progress: 0 }));
            break;
          case "Progress":
            const progress = event.data.chunkLength ? Math.min(Math.round((event.data.chunkLength / 1000000) * 100), 100) : 0;
            setUpdateState(prev => ({ ...prev, progress }));
            break;
          case "Finished":
            setUpdateState(prev => ({ ...prev, progress: 100 }));
            break;
        }
      });

      // Update completed - user will need to restart manually
      setShowProgress(false);
      alert('Update installed successfully! Please restart the application.');
    } catch (error) {
      console.error("Failed to download and install update:", error);
      setUpdateState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Update failed",
        downloading: false,
      }));
      setShowProgress(false);
    }
  };

  // Check for updates on app startup
  useEffect(() => {
    // Only check in production builds
    if (import.meta.env.PROD) {
      checkForUpdates();
    }
  }, []);

  return (
    <>
      {/* Update available dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Available</DialogTitle>
            <DialogDescription>
              Version {updateState.update?.version} is available. Would you like to download and install it?
            </DialogDescription>
          </DialogHeader>

          {updateState.update?.body && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">What's new:</h4>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-40 overflow-y-auto whitespace-pre-wrap">
                {updateState.update.body}
              </div>
            </div>
          )}

          <DialogFooter className="flex-row gap-2">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => {
                if (updateState.update?.version) {
                  skipVersion(updateState.update.version);
                }
                setShowDialog(false);
              }}
            >
              Skip this version
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Set reminder for 24 hours later
                  const remindTime = new Date();
                  remindTime.setHours(remindTime.getHours() + REMIND_LATER_HOURS);
                  localStorage.setItem(STORAGE_KEYS.REMIND_LATER_TIME, remindTime.toISOString());
                  setShowDialog(false);
                }}
              >
                Remind me later
              </Button>
              <Button onClick={downloadAndInstall}>
                Update Now
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download progress dialog */}
      <Dialog open={showProgress} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Downloading Update</DialogTitle>
            <DialogDescription>
              Please wait while the update is being downloaded and installed...
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <Progress value={updateState.progress} className="w-full" />
            <div className="text-sm text-center text-muted-foreground">
              {updateState.progress}%
            </div>
          </div>

          {updateState.error && (
            <div className="mt-4 text-sm text-destructive">
              Error: {updateState.error}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}