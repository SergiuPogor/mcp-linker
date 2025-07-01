import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Nav } from "@/types";
import { User, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ModeToggle } from "../ui/mode-toggle";

interface SidebarProps {
  navs: Nav[];
  isCollapsed: boolean;
}

export const Sidebar = ({ navs, isCollapsed }: SidebarProps) => {
  const { t } = useTranslation<"translation">();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { user } = useAuth();

  return (
    <div
      className={`flex flex-col justify-between h-screen bg-background border-r px-2 transition-all duration-300 ${isCollapsed ? "w-12" : "w-56"}`}
    >
      <div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"></span>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            placeholder={t("searchPlaceholder")}
            className="w-full"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-">
          {navs.map((nav) => (
            <Link key={nav.id} to={nav.path || `/${nav.id}`} className="w-full">
              <Button
                variant={
                  location.pathname === (nav.path || `/${nav.id}`)
                    ? "secondary"
                    : "ghost"
                }
                className={`w-full justify-start p-2 ${isCollapsed ? "justify-center" : ""}`}
              >
                <span className="text-xl">{nav.icon}</span>
                {!isCollapsed && <span>{nav.name}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* user info */}
      <div className="flex items-center gap-3 mb-12">
        <Link
          to={user ? "/dashboard" : "/auth"}
          className={`flex items-center gap-3 flex-grow ${isCollapsed ? "justify-center" : ""}`}
        >
          {user?.user_metadata.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              className="rounded-full w-6 h-6"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="w-6 h-6" />
            </div>
          )}
          {!isCollapsed && (
            <p className="font-medium">
              {user?.user_metadata.full_name ||
                user?.user_metadata.user_name ||
                user?.user_metadata.email.slice(0, 2) ||
                t("guest")}
            </p>
          )}
        </Link>
        {!isCollapsed && <ModeToggle />}
      </div>
    </div>
  );
};
