import { Dashboard } from "@/components/manage/Dashboard";
import { PersonalMcpSection } from "@/components/manage/PersonalMcpSection";
import { TeamMcpSection } from "@/components/manage/TeamMcpSection";
import { TeamTrialSection } from "@/components/manage/TeamTrialSection";
import { ServerTemplateDialog } from "@/components/server";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useTeamTrialStatus } from "@/hooks/useTeamTrialStatus";
import { fetchMyTeams } from "@/services/teamService";
import { useStatsStore } from "@/stores/statsStore";
import { useTabStore } from "@/stores/tabStore";
import { useTeamStore } from "@/stores/team";
import { UserWithTier, useUserStore } from "@/stores/userStore";
import { getEncryptionKey } from "@/utils/encryption";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function McpManage() {
  const {
    mainTab,
    personalTab,
    teamTab,
    setMainTab,
    setPersonalTab,
    setTeamTab,
  } = useTabStore();
  const { isAuthenticated } = useAuth();
  const { selectedTeamId } = useTeamStore();
  const [teamCount, setTeamCount] = useState(0);
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const personalStats = useStatsStore((s) => s.personalStats);
  const teamStats = useStatsStore((s) => s.teamStats);
  const navigate = useNavigate();
  const { user, loading: userLoading, fetchUser } = useUserStore();
  const { hasTrial, isTeamUser, isTeamOrTrialActive } =
    useTeamTrialStatus(user);

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

  // Load team count for reliable team management UI
  useEffect(() => {
    async function loadTeamCount() {
      if (isAuthenticated && isTeamOrTrialActive) {
        try {
          const teams = await fetchMyTeams();
          console.log(teams.length, hasTrial);
          console.log(teams);
          setTeamCount(teams.length);
        } catch (error) {
          setTeamCount(0);
        }
      }
    }
    loadTeamCount();
  }, [isAuthenticated, isTeamOrTrialActive]);

  const handleAddServer = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 bg-background text-foreground">
      <Tabs
        value={mainTab}
        onValueChange={setMainTab}
        className="h-full flex flex-col"
      >
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
            <TabsList className="grid grid-cols-2 gap-2 bg-secondary">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>
          </span>
        </div>

        {/* Dashboard */}
        <Dashboard personalStats={personalStats} teamStats={teamStats} />

        <div className="flex-1 min-h-0">
          {/* personal */}
          <TabsContent value="personal" className="flex-1 min-h-0">
            <PersonalMcpSection
              personalTab={personalTab}
              setPersonalTab={setPersonalTab}
              user={user as UserWithTier}
              isAuthenticated={isAuthenticated}
              encryptionKey={encryptionKey}
              navigate={navigate}
            />
          </TabsContent>

          {/* team */}
          <TabsContent value="team" className="flex-1 min-h-0">
            <TeamTrialSection />
            {isTeamOrTrialActive && (
              <TeamMcpSection
                teamTab={teamTab}
                setTeamTab={setTeamTab}
                isAuthenticated={isAuthenticated}
                teamCount={teamCount}
                selectedTeamId={selectedTeamId}
                userLoading={userLoading}
                hasTrial={hasTrial}
                isTeamUser={isTeamUser}
                navigate={navigate}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>

      <ServerTemplateDialog
        isOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </div>
  );
}
