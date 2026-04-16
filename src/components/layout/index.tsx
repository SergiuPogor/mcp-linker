import { ProjectSelector } from "@/components/claude-code/ProjectSelector";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { needspathClient } from "@/lib/data";
import { AppRoutes, getNavigationRoutes } from "@/routes";
import { useClientPathStore } from "@/stores/clientPathStore";
import { platform } from "@tauri-apps/plugin-os";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";
import { ClientSelector } from "../settings/client-selector";
import { PathSelector } from "../settings/PathSelector";

const Layout = () => {
  const { selectedClient } = useClientPathStore();
  const { t } = useTranslation();
  const isMacOS = platform() === "macos";
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get navigation routes with icons
  const navs = getNavigationRoutes(t as (key: string, options?: any) => string);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar navs={navs} />

      <SidebarInset>
        {/* Main vertical layout: top bar, main content, status bar */}
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
          {/* Header Controls */}
          <div
            data-tauri-drag-region
            className="flex shrink-0 items-center gap-2 p-2"
          >
            {isMacOS && (
              <SidebarTrigger
                className={sidebarOpen ? "shrink-0" : "ml-8 shrink-0"}
              />
            )}
            <>
              <ClientSelector />
              {needspathClient.includes(selectedClient) && <PathSelector />}
              {selectedClient === "claude_code" && (
                <ProjectSelector />
              )}
            </>
          </div>

          <main className="flex-1">
            <AppRoutes />
          </main>

          <Toaster position="top-center" richColors />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
