import { Button } from "@/components/ui/button";
import { Category } from "@/types";
import { open } from "@tauri-apps/plugin-shell";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { ModeToggle } from "./mode-toggle";

interface SidebarProps {
  appCategories: Category[];
}

export const Sidebar = ({ appCategories }: SidebarProps) => {
  const { t } = useTranslation<"translation">();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={`flex flex-col justify-between h-screen bg-background border-r p-2 transition-all duration-300 ${isCollapsed ? "w-16" : "w-56"}`}
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <div
            onClick={() =>
              open("https://github.com/milisp/mcp-linker?from=mcp-linker")
            }
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            {!isCollapsed && (
              <span className="text-xl font-bold">{t("mcpLinker")}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? "→" : "←"}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {appCategories.map((category) => (
            <Link key={category.id} to={`/${category.id}`} className="w-full">
              <Button
                variant={
                  location.pathname === `/${category.id}`
                    ? "secondary"
                    : "ghost"
                }
                className={`w-full justify-start p-2 ${isCollapsed ? "justify-center" : ""}`}
              >
                <span className="text-xl">{category.icon}</span>
                {!isCollapsed && <span className="ml-2">{category.name}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="w-full flex items-center gap-3">
        <Link
          to="/recently"
          className={`flex items-center gap-3 flex-grow ${isCollapsed ? "justify-center" : ""}`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-lg">
            {t("username")[0].toUpperCase()}
          </div>
          {!isCollapsed && (
            <div>
              <p className="font-medium">{t("username")}</p>
              <p className="text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                0.00
              </p>
            </div>
          )}
        </Link>
        {!isCollapsed && <ModeToggle />}
      </div>
    </div>
  );
};
