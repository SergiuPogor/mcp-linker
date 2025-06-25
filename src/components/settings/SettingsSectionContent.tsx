import EncryptionKeyCard from "@/components/settings/EncryptionKeyCard";
import SecurityNoticeCard from "@/components/settings/SecurityNoticeCard";
import { Switch } from "@/components/ui/switch";
import { useConsentStore } from "@/stores/consentStore";
import React from "react";

interface Key {
  id: string;
  name: string;
  type: "personal" | "team";
}

interface SettingsSectionContentProps {
  selectedSection: string;
  keys: Key[];
}

// Main content area for settings page, renders section content
const SettingsSectionContent: React.FC<SettingsSectionContentProps> = ({
  selectedSection,
  keys,
}) => {
  // Use zustand store for privacy state
  const telemetryEnabled = useConsentStore((state) => state.telemetryEnabled);
  const setTelemetryEnabled = useConsentStore(
    (state) => state.setTelemetryEnabled,
  );

  if (selectedSection === "encryption") {
    return (
      <div className="space-y-4">
        {keys.map((key) => (
          <EncryptionKeyCard
            key={key.id}
            keyId={key.id}
            keyName={key.name}
            type={key.type}
          />
        ))}
        {/* Security Notice always at the bottom */}
        <SecurityNoticeCard />
      </div>
    );
  }
  if (selectedSection === "telemetry") {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Telemetry Management</h2>
        <div className="flex items-center space-x-4">
          <span>Allow anonymous usage data</span>
          <Switch
            checked={telemetryEnabled}
            onCheckedChange={setTelemetryEnabled}
          />
        </div>
      </div>
    );
  }
  // Add more sections here
  return null;
};

export default SettingsSectionContent;
