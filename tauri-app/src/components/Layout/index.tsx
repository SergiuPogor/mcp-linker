import { usePlatform } from "@/hooks/usePlatform";
import { needspathClient } from "@/lib/data";
import { AppRoutes, getNavigationRoutes } from "@/routes";
import { useClientPathStore } from "@/stores/clientPathStore";
import { PanelLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";
import { ClientSelector } from "../settings/client-selector";
import LangSelect from "../settings/LangSelect";
import { PathSelector } from "../settings/PathSelector";
import { Sidebar } from "./Sidebar";

const Layout = () => {
  const { selectedClient } = useClientPathStore();
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { isMacOS } = usePlatform();

  // Get navigation routes with icons
  const navs = getNavigationRoutes(t as (key: string, options?: any) => string);

  return (
    // Main vertical layout: top bar, main content, status bar
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      {/* Header Controls */}
      <div
        id="titlebar"
        className={`flex justify-between pt-2 ${
          isMacOS ? "pl-20 pr-2" : "px-2"
        } shrink-0 items-center`}
      >
        <span className="flex">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="pr-2"
          >
            <PanelLeft size={20} />
          </button>
          <ClientSelector />
        </span>
        {needspathClient.includes(selectedClient) && <PathSelector />}
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
