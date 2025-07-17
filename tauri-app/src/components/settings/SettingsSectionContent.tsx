import EncryptionKeyCard from "@/components/settings/EncryptionKeyCard";
import SecurityNoticeCard from "@/components/settings/SecurityNoticeCard";
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
  // Add more sections here
  return null;
};

export default SettingsSectionContent;
