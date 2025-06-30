import SettingsSectionContent from "@/components/settings/SettingsSectionContent";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import { useTeam } from "@/hooks/useTeam";
import { useEffect, useState } from "react";

interface Key {
  id: string;
  name: string;
  type: "personal" | "team";
}

// Settings sections
const SECTIONS = [
  { id: "encryption", label: "Encryption" },
  { id: "telemetry", label: "Telemetry" },
  // Add more sections here in the future
];

export default function SettingPage() {
  const { teams, fetchMyTeams } = useTeam();
  const [keys, setKeys] = useState<Key[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>("encryption");

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
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your encryption keys and security settings
        </p>
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
    </div>
  );
}
