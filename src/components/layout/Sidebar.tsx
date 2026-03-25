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
  const view = useViewStore((s) => s.view);
  const { navigate } = useViewStore();
  const { user } = useAuth();

  if (isCollapsed) {
    return (
      <div className="flex flex-col justify-between h-screen bg-background border-r px-2 transition-all duration-300 w-12">
        <div>
          <div className="flex flex-col gap-1">
            {navs.map((nav) => (
              <button
                key={nav.id}
                onClick={() => navigate(nav.path || `/${nav.id}`)}
                className="w-full"
              >
                <Button
                  variant={view === nav.id ? "secondary" : "ghost"}
                  className="w-full justify-center p-2"
                  asChild={false}
                >
                  <span className="text-xl">{nav.icon}</span>
                </Button>
              </button>
            ))}
          </div>
        </div>

        {/* user info */}
        <div className="flex items-center justify-center mb-12">
          <button
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="flex items-center justify-center"
          >
            {user?.user_metadata.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                className="rounded-full w-6 h-6"
              />
            ) : (
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background border-r transition-all duration-300 w-56">
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
                  className="w-full justify-start p-2"
                  asChild={false}
                >
                  <span className="text-xl">{nav.icon}</span>
                  <span>{nav.name}</span>
                </Button>
              </button>
            ))}
          </div>
        </div>

        {/* User info */}
        <div className="shrink-0 flex items-center gap-3 mb-12 border-t">
          <button
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="flex items-center gap-3 flex-grow min-w-0"
          >
            {user?.user_metadata.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                className="rounded-full w-6 h-6 shrink-0"
              />
            ) : (
              <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
            )}
            <p className="font-medium text-sm truncate">
              {user?.user_metadata.full_name ||
                user?.user_metadata.user_name ||
                user?.user_metadata.email?.slice(0, 2) ||
                t("guest")}
            </p>
          </button>
          <div className="shrink-0">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};
