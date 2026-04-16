import SettingsSectionContent from "@/components/settings/SettingsSectionContent";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpdateStore } from "@/stores/useUpdateStore";

interface Key {
  id: string;
  name: string;
}

// Settings sections
const SECTIONS = [
  { id: "encryption", label: "Encryption" },
  // Add more sections here in the future
];

const DEFAULT_KEYS: Key[] = [{ id: "personal", name: "Personal" }];

export default function SettingPage() {
  const [selectedSection, setSelectedSection] = useState<string>("encryption");
  const { isChecking, triggerManualCheck } = useUpdateStore();

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
            disabled={isChecking}
            onClick={() => triggerManualCheck()}
          >
            {isChecking ? "Checking…" : "Check for Updates"}
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
            keys={DEFAULT_KEYS}
          />
        </div>
      </div>
    </div>
  );
}

