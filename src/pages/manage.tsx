import { Dashboard } from "@/components/manage/Dashboard";
import { PersonalMcpSection } from "@/components/manage/PersonalMcpSection";
import { ServerTemplateDialog } from "@/components/server";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsFreeUser } from "@/hooks/useTier";
import { useGlobalDialogStore } from "@/stores/globalDialogStore";
import { useStatsStore } from "@/stores/statsStore";
import { useUserStore } from "@/stores/userStore";
import { useViewStore } from "@/stores/viewStore";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function McpManage() {
  const { isAuthenticated } = useAuth();
  const { fetchUser } = useUserStore();
  const isFreeUser = useIsFreeUser();
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { personalStats } = useStatsStore();
  const { navigate } = useViewStore();
  const showGlobalDialog = useGlobalDialogStore((s) => s.showDialog);

  useEffect(() => {
    fetchUser(); // Fetch user info (with tier) on mount
  }, [fetchUser]);

  const FREE_SERVER_LIMIT = 1;
  const isLimitedUser = !isAuthenticated || isFreeUser;

  const handleAddServer = () => {
    if (isLimitedUser && personalStats.total >= FREE_SERVER_LIMIT) {
      showGlobalDialog(isAuthenticated ? "upgrade" : "login");
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 bg-background text-foreground">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">MCP Server Management</h1>
          <span className="flex items-center gap-2">
            <Button
              className="flex"
              onClick={() => {
                navigate(0);
              }}
            >
              <RefreshCcw /> Refresh
            </Button>
            <Button onClick={handleAddServer}>{t("addCustomServer")}</Button>
          </span>
        </div>

        {/* Dashboard */}
        <Dashboard personalStats={personalStats} />

        <div className="flex-1 min-h-0">
          <PersonalMcpSection />
        </div>
      </div>

      <ServerTemplateDialog
        isOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
}
