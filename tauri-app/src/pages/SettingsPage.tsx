import SettingsSectionContent from "@/components/settings/SettingsSectionContent";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { useTeam } from "@/hooks/useTeam";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { check, Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "sonner";

interface Key {
  id: string;
  name: string;
  type: "personal" | "team";
}

// Settings sections
const SECTIONS = [
  { id: "encryption", label: "Encryption" },
  // Add more sections here in the future
];

export default function SettingPage() {
  const { teams, fetchMyTeams } = useTeam();
  const [keys, setKeys] = useState<Key[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("encryption");
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [update, setUpdate] = useState<Update | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  useEffect(() => {
    fetchMyTeams();
  }, []);
  useEffect(() => {
    // Update keys when teams change
    const updatedKeys: Key[] = [
      { id: "personal", name: "Personal", type: "personal" },
      ...teams.map((team) => ({
        id: team.id,
        name: team.name,
        type: "team" as const,
      })),
    ];
    setKeys(updatedKeys);
  }, [teams]);

  // Main render
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Settings</h1>
            <p className="text-muted-foreground">Manage your encryption keys and security settings</p>
          </div>
          <Button
            variant="outline"
            disabled={checkingUpdate}
            onClick={async () => {
              setCheckingUpdate(true);
              try {
                const result = await check();
                if (result) {
                  setUpdate(result);
                  setShowUpdateDialog(true);
                } else {
                  toast.success("You're up to date.");
                }
              } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                toast.error(`Update check failed: ${message}`);
              } finally {
                setCheckingUpdate(false);
              }
            }}
          >
            {checkingUpdate ? "Checking…" : "Check for Updates"}
          </Button>
        </div>
      </div>
      <div className="flex gap-8">
        {/* Sidebar navigation */}
        <SettingsSidebar
          sections={SECTIONS}
          selectedSection={selectedSection}
          onSelectSection={setSelectedSection}
        />
        {/* Main content area */}
        <div className="flex-1 space-y-6">
          <SettingsSectionContent
            selectedSection={selectedSection}
            keys={keys}
          />
        </div>
      </div>

      {/* Update available dialog (manual) */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Available</DialogTitle>
            <DialogDescription>
              Version {update?.version} is available. Would you like to download and install it now?
            </DialogDescription>
          </DialogHeader>

          {update?.body && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">What's new:</h4>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-40 overflow-y-auto whitespace-pre-wrap">
                {update.body}
              </div>
            </div>
          )}

          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!update) return;
                try {
                  await update.downloadAndInstall();
                  await relaunch();
                } catch (err) {
                  const message = err instanceof Error ? err.message : String(err);
                  toast.error(`Update failed: ${message}`);
                }
              }}
            >
              Update Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
