import { useViewStore } from "@/stores/viewStore";
import { Dashboard } from "@/components/manage/Dashboard";
import { PersonalMcpSection } from "@/components/manage/PersonalMcpSection";
import { ServerTemplateDialog } from "@/components/server";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsFreeUser } from "@/hooks/useTier";
import { useStatsStore } from "@/stores/statsStore";
import { useGlobalDialogStore } from "@/stores/globalDialogStore";
import { useTabStore } from "@/stores/tabStore";
import { UserWithTier, useUserStore } from "@/stores/userStore";
import { getEncryptionKey } from "@/utils/encryption";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function McpManage() {
  const { personalTab, setPersonalTab } = useTabStore();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const personalStats = useStatsStore((s) => s.personalStats);
  const { navigate } = useViewStore();
  const { user, fetchUser } = useUserStore();
  const isFreeUser = useIsFreeUser();
  const showGlobalDialog = useGlobalDialogStore((s) => s.showDialog);

  useEffect(() => {
    async function fetchKey() {
      const key = getEncryptionKey();
      setEncryptionKey(key);
    }
    fetchKey();
  }, []);

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
          <h1 className="text-2xl font-bold">Personal MCP Server Management</h1>
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
          <PersonalMcpSection
            personalTab={personalTab}
            setPersonalTab={setPersonalTab}
            user={user as UserWithTier}
            isAuthenticated={isAuthenticated}
            encryptionKey={encryptionKey}
            navigate={navigate}
          />
        </div>
      </div>

      <ServerTemplateDialog
        isOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
}
