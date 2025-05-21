import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { Nav } from "@/types";
import { User, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brand } from "./brand";
import { ModeToggle } from "./mode-toggle";

interface SidebarProps {
  navs: Nav[];
}

export const Sidebar = ({ navs }: SidebarProps) => {
  const { t } = useTranslation<"translation">();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { user } = useAuth();

  return (
    <div
      className={`flex flex-col justify-between h-screen bg-background border-r p-2 transition-all duration-300 ${isCollapsed ? "w-16" : "w-56"}`}
    >
      <div>
        <Brand isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
            🔍
          </span>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            placeholder={t("searchPlaceholder")}
            className="pl-10 pr-4 w-full"
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

        <div className="flex flex-col gap-2">
          {navs.map((nav) => (
            <Link key={nav.id} to={`/${nav.id}`} className="w-full">
              <Button
                variant={
                  location.pathname === `/${nav.id}` ? "secondary" : "ghost"
                }
                className={`w-full justify-start p-2 ${isCollapsed ? "justify-center" : ""}`}
              >
                <span className="text-xl">{nav.icon}</span>
                {!isCollapsed && <span className="ml-2">{nav.name}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="w-full flex items-center gap-3">
        <Link
          to="/auth"
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
              {user?.user_metadata.full_name || t("guest")}
            </p>
          )}
        </Link>
        {!isCollapsed && <ModeToggle />}
      </div>
    </div>
  );
};
