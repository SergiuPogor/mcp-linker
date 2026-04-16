import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { getNavigationRoutes } from "@/routes"
import { signOut } from "@/services/auth"
import { useViewStore } from "@/stores/viewStore"
import { platform } from "@tauri-apps/plugin-os"
import { open } from "@tauri-apps/plugin-shell"
import { User } from "lucide-react"
import { useTranslation } from "react-i18next"

export const AppSidebar = () => {
  const { t } = useTranslation<"translation">()
  const navs = getNavigationRoutes(t as any);
  const { view, navigate } = useViewStore()
  const { user } = useAuth()
  const platformName = platform()
  const isMacOS = platformName === "macos"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        data-tauri-drag-region
        className={cn(isMacOS && "min-h-11 pt-3")}
      >
        {!isMacOS && <SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navs.map((nav) => (
            <SidebarMenuItem key={nav.id}>
              <SidebarMenuButton
                isActive={view === nav.id}
                onClick={() => navigate(`/${nav.id}`)}
              >
                {nav.icon}
                <span>{nav.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground">
                  <User className="w-4 h-4" />
                  <span>
                    {user?.user_metadata.full_name ||
                      user?.user_metadata.user_name ||
                      user?.user_metadata.email?.slice(0, 2) ||
                      t("guest")}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem
                  onClick={() => open("https://github.com/milisp/mcp-linker/issues")}
                >
                  <span>{t("feedback")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user?.email ? (
                  <DropdownMenuItem>
                    <span className="truncate">{user.email}</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/auth")}>
                    Login
                  </DropdownMenuItem>
                )}
                {user && (
                  <DropdownMenuItem onClick={() => signOut()}>
                    Logout
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
