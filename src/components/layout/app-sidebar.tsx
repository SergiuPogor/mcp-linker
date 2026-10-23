import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { getNavigationRoutes } from "@/routes"
import { useViewStore } from "@/stores/viewStore"
import { openUrl } from '@tauri-apps/plugin-opener'
import { platform } from "@tauri-apps/plugin-os"
import { CircleHelp, Info, Mail, MessageCircle, Settings, User } from "lucide-react"
import { useTranslation } from "react-i18next"
import { InstallationTarget } from "@/components/settings/InstallationTarget"

export const AppSidebar = () => {
  const { t } = useTranslation<"translation">()
  const navs = getNavigationRoutes(t as any);
  const { view, navigate } = useViewStore()
  const platformName = platform()
  const isMacOS = platformName === "macos"
  const { open } = useSidebar()

  return (
    <Sidebar
      // macOS: hide fully when collapsed instead of leaving an icon column under the traffic lights
      collapsible={isMacOS ? "offcanvas" : "icon"}
      className={cn(
        "border-sidebar-border/50",
        // macOS: no vertical divider, so nothing runs past the traffic lights
        isMacOS && "group-data-[side=left]:border-r-0"
      )}
    >
      <SidebarHeader
        data-tauri-drag-region
        className={cn(isMacOS && "h-11 justify-center p-0")}
      >
      </SidebarHeader>
      <SidebarContent className="gap-1 px-2">
        <SidebarMenu>
          {navs.filter(nav => nav.id === "discover").map((nav) => (
            <SidebarMenuItem key={nav.id}>
              <SidebarMenuButton
                isActive={["discover", "manage", "skills", "plugins", "favorites", "collection", "recently"].includes(view)}
                onClick={() => navigate(`/${nav.id}`)}
              >
                {nav.icon}
                <span>{nav.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarMenu>
          {navs.filter(nav => nav.id !== "discover").map(nav => (
            <SidebarMenuItem key={nav.id}>
              <SidebarMenuButton isActive={view === nav.id} onClick={() => navigate(`/${nav.id}`)}>
                {nav.icon}<span>{nav.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        {open && <InstallationTarget sidebar allowClientChange={false} />}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <span className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground">
                  <User className="w-4 h-4" />
                  {open && <span>{t("guest")}</span>}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings />
                  {t("nav.settings")}
                  <DropdownMenuShortcut>{isMacOS ? "⌘," : "Ctrl+,"}</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {open && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <CircleHelp />
                    <span className="sr-only">{t("help")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => openUrl("https://github.com/milisp/mcp-linker/issues/new/choose")}
                  >
                    <MessageCircle />
                    <span>{t("feedback")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openUrl("mailto:hi@milisp.dev")}>
                    <Mail />
                    <span>{t("contact")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/about")}>
                    <Info />
                    <span>{t("nav.about")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            </span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
