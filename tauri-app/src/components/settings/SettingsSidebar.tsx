import React from "react";

interface Section {
  id: string;
  label: string;
}

interface SettingsSidebarProps {
  sections: Section[];
  selectedSection: string;
  onSelectSection: (id: string) => void;
}

// Sidebar navigation for settings page
const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  sections,
  selectedSection,
  onSelectSection,
}) => {
  return (
    <nav className="w-48 flex-shrink-0 space-y-2 border-r pr-4">
      {sections.map((section) => (
        <button
          key={section.id}
          className={`w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors font-medium ${selectedSection === section.id ? "bg-muted" : ""}`}
          onClick={() => onSelectSection(section.id)}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
};

export default SettingsSidebar;
