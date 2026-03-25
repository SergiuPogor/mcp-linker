import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useViewStore } from "@/stores/viewStore";
import { Nav } from "@/types";
import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModeToggle } from "../ui/mode-toggle";

interface SidebarProps {
  navs: Nav[];
  isCollapsed: boolean;
}

export const Sidebar = ({ navs, isCollapsed }: SidebarProps) => {
  const { t } = useTranslation<"translation">();
  const { view, navigate } = useViewStore();
  const { user } = useAuth();

  return (
    <div
      className={`flex flex-col h-screen bg-background border-r transition-all duration-300 ${
        isCollapsed ? "w-12 px-2" : "w-56"
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 px-2 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navs.map((nav) => (
              <button
                key={nav.id}
                onClick={() => navigate(nav.path || `/${nav.id}`)}
                className="w-full"
              >
                <Button
                  variant={view === nav.id ? "secondary" : "ghost"}
                  className={`w-full p-2 ${isCollapsed ? "justify-center" : "justify-start"}`}
                  asChild={false}
                >
                  <span className="text-xl">{nav.icon}</span>
                  {!isCollapsed && <span>{nav.name}</span>}
                </Button>
              </button>
            ))}
          </div>
        </div>

        {/* User info */}
        <div
          className={`shrink-0 flex items-center mb-12 border-t p-2 ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <button
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 flex-grow min-w-0"}`}
          >
            {user?.user_metadata.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                className="rounded-full w-6 h-6 shrink-0"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
            {!isCollapsed && (
              <p className="font-medium text-sm truncate">
                {user?.user_metadata.full_name ||
                  user?.user_metadata.user_name ||
                  user?.user_metadata.email?.slice(0, 2) ||
                  t("guest")}
              </p>
            )}
          </button>
          {!isCollapsed && (
            <div className="shrink-0">
              <ModeToggle />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
