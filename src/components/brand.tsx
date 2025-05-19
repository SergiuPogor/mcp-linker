import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/plugin-shell";
import { useTranslation } from "react-i18next";

export const Brand = ({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: (val: boolean) => void }) => {
  const { t } = useTranslation<"translation">();

  return (
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
  );
};
