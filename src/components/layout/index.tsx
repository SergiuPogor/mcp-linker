import { ProjectSelector } from "@/components/claude-code/ProjectSelector";
import { Sidebar } from "@/components/layout/Sidebar";
import { useTier } from "@/hooks/useTier";
import { needspathClient } from "@/lib/data";
import { AppRoutes, getNavigationRoutes } from "@/routes";
import { useClientPathStore } from "@/stores/clientPathStore";
import { open } from "@tauri-apps/plugin-shell";
import { MessageCircle, PanelLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";
import { UpgradePlanButton } from "../common/UpgradePlanButton";
import { ClientSelector } from "../settings/client-selector";
import LangSelect from "../settings/LangSelect";
import { PathSelector } from "../settings/PathSelector";

const Layout = () => {
  const { selectedClient } = useClientPathStore();
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { hasPaidTier } = useTier();

  // Get navigation routes with icons
  const navs = getNavigationRoutes(t as (key: string, options?: any) => string);

  return (
    // Main vertical layout: top bar, main content, status bar
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      {/* Header Controls */}
      <div
        data-tauri-drag-region
        className={`flex justify-between ${
          sidebarCollapsed ? "pl-20" : "pl-50 pr-2"
        } shrink-0 items-center`}
      >
        <span className="flex">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="pr-2"
          >
            <PanelLeft size={20} />
          </button>
          <ClientSelector /> {!hasPaidTier && <UpgradePlanButton />}
        </span>
        <>
          {needspathClient.includes(selectedClient) && <PathSelector />}
          {selectedClient === "claude_code" && (
            <span className="ml-2">
              <ProjectSelector />
            </span>
          )}
        </>
        <span className="flex">
          <LangSelect />
          <button
            onClick={() => open("https://mcp-linker.store/feedback")}
            className="flex ml-2 hover:text-blue-500 items-center whitespace-nowrap"
            title={t("feedback")}
          >
            <MessageCircle size={20} className="mr-1" />
            {t("feedback")}
          </button>
        </span>
      </div>

      {/* Main content area: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar on the left */}
        <Sidebar navs={navs} isCollapsed={sidebarCollapsed} />

        {/* Main content on the right */}
        <div className="flex-1 overflow-auto">
          <AppRoutes />
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default Layout;
