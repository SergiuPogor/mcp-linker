import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { open } from "@tauri-apps/plugin-shell";
import { useState } from "react";

interface UpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  latestVersion: string;
  releaseNotes: string;
  releaseUrl: string;
}

export function UpdateDialog({
  isOpen,
  onClose,
  latestVersion,
  releaseNotes,
  releaseUrl,
}: UpdateDialogProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleUpdate = async () => {
    setIsOpening(true);
    try {
      await open(releaseUrl);
    } catch (error) {
    } finally {
      setIsOpening(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Version Available</DialogTitle>
          <DialogDescription>
            Version {latestVersion} is now available. Would you like to go to
            the GitHub release page?
          </DialogDescription>
        </DialogHeader>

        {releaseNotes && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">What's new:</h4>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-40 overflow-y-auto whitespace-pre-wrap">
              {releaseNotes}
            </div>
          </div>
        )}

        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Later
          </Button>
          <Button onClick={handleUpdate} disabled={isOpening}>
            {isOpening ? "Opening..." : "Go to Release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
