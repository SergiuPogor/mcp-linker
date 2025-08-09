import { needspathClient } from "@/lib/data";
import { AppRoutes, getNavigationRoutes } from "@/routes";
import { useConfigScopeStore } from "@/stores";
import { useClientPathStore } from "@/stores/clientPathStore";
import { PanelLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";
import { TeamSelector } from "../manage/team/TeamSelector";
import {
  ClientSelector,
  ConfigScopeSelector,
} from "../settings/client-selector";
import { ConfigFileSelector } from "../settings/ConfigFileSelector";
import LangSelect from "../settings/LangSelect";
import { PathSelector } from "../settings/PathSelector";
import { Sidebar } from "./Sidebar";

const Layout = () => {
  const { selectedClient } = useClientPathStore();
  const { scope } = useConfigScopeStore();
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get navigation routes with icons
  const navs = getNavigationRoutes(t as (key: string, options?: any) => string);

  return (
    // Main vertical layout: top bar, main content, status bar
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      {/* Header Controls */}
      <div
        data-tauri-drag-region
        className={`flex justify-between ${
          sidebarCollapsed ?  "pl-20" : "pl-50 pr-2"
        } shrink-0 items-center`}
      >
        <span className="flex">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="pr-2"
          >
            <PanelLeft size={20} />
          </button>
          <ConfigScopeSelector />
          {scope === "personal" ? <ClientSelector /> : <TeamSelector />}
        </span>
        {scope === "personal" ? (
          <>{needspathClient.includes(selectedClient) && <PathSelector />}</>
        ) : (
          <ConfigFileSelector />
        )}
        <LangSelect />
      </div>

      {/* Main content area: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar on the left */}
        <Sidebar navs={navs} isCollapsed={sidebarCollapsed} />

        {/* Main content on the right */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <AppRoutes />
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default Layout;
