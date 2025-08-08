import { Dashboard } from "@/components/manage/Dashboard";
import { PersonalMcpSection } from "@/components/manage/PersonalMcpSection";
import { ServerTemplateDialog } from "@/components/server";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useStatsStore } from "@/stores/statsStore";
import { useTabStore } from "@/stores/tabStore";
import { UserWithTier, useUserStore } from "@/stores/userStore";
import { getEncryptionKey } from "@/utils/encryption";
import { RefreshCcw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function McpManage() {
  const { personalTab, setPersonalTab } = useTabStore();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const personalStats = useStatsStore((s) => s.personalStats);
  const teamStats = useStatsStore((s) => s.teamStats);
  const navigate = useNavigate();
  const { user, fetchUser } = useUserStore();

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

  const handleAddServer = () => {
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
            <Button
              variant="outline"
              onClick={() => {
                navigate("/team");
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Team Management
            </Button>
          </span>
        </div>

        {/* Dashboard */}
        <Dashboard personalStats={personalStats} teamStats={teamStats} />

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
