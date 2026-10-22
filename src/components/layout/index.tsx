import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppRoutes } from "@/routes";
import { useViewStore } from "@/stores/viewStore";
import { platform } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ClientSelector } from "../settings/client-selector";
import { InstallationScope, InstallationTarget } from "../settings/InstallationTarget";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Layout = () => {
  const isMacOS = platform() === "macos";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { view, navigate, history, historyIndex } = useViewStore();

  // Cmd+, (Ctrl+, elsewhere) opens settings, the standard settings shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "," && (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        navigate("/settings");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        {/* Main vertical layout: top bar, main content, status bar */}
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <header
              data-tauri-drag-region
              className={cn("flex shrink-0 items-center gap-2", isMacOS ? "h-11 px-2" : "p-2")}
            >
                <SidebarTrigger
                  className={isMacOS && !sidebarOpen ? "ml-20 shrink-0" : "shrink-0"}
                />
              <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Page navigation">
                <Button variant="ghost" size="icon" aria-label="Go back" title="Go back" disabled={historyIndex === 0} onClick={() => navigate(-1)}><ArrowLeft className="size-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Go forward" title="Go forward" disabled={historyIndex >= history.length - 1} onClick={() => navigate(1)}><ArrowRight className="size-4" /></Button>
              </div>
              {!["auth", "notes", "about", "settings"].includes(view) && <><ClientSelector /><InstallationScope /><InstallationTarget allowClientChange={false} compact /></>}
            </header>

          <AnnouncementBanner />

          <main className="flex-1 overflow-auto">
            <AppRoutes />
          </main>

          <Toaster position="top-center" richColors />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
