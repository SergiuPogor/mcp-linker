import { Dashboard } from "@/components/manage/Dashboard";
import { LocalTable } from "@/components/manage/LocalTable/index";
import { PersonalCloudTable } from "@/components/manage/PersonalCloudTable";
import { TeamCloudTable } from "@/components/manage/team/TeamCloudTable";
import { TeamLocalTable } from "@/components/manage/team/TeamLocalTable";
import { TeamSelector } from "@/components/manage/team/TeamSelector";
import { ServerTemplateDialog } from "@/components/server";
import { ConfigFileSelector } from "@/components/settings/ConfigFileSelector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useStatsStore } from "@/stores/statsStore";
import { useTabStore } from "@/stores/tabStore";
import { useTeamStore } from "@/stores/team";
import { useUserStore } from "@/stores/userStore";
import { getEncryptionKey } from "@/utils/encryption";
import { open } from "@tauri-apps/plugin-shell";
import { Cloud, RefreshCcw } from "lucide-react";
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
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  const personalStats = useStatsStore((s) => s.personalStats);
  const teamStats = useStatsStore((s) => s.teamStats);
  const navigate = useNavigate();
  const { user, loading: userLoading, fetchUser } = useUserStore();

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
            <Tabs
              value={personalTab}
              onValueChange={setPersonalTab}
              className="h-full flex flex-col"
            >
              <TabsList className="grid grid-cols-2 gap-2 bg-secondary">
                <TabsTrigger value="personalLocal">Local</TabsTrigger>
                <TabsTrigger value="personalCloud">
                  <Cloud />
                  Cloud {user?.tier === "FREE" && "🔒"}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="personalLocal" className="flex-1 min-h-0">
                <LocalTable userTier={user?.tier} isAuthenticated={isAuthenticated} />
              </TabsContent>
              <TabsContent value="personalCloud" className="flex-1 min-h-0">
                {isAuthenticated ? (
                  user?.tier !== "FREE" ? (
                    <PersonalCloudTable />
                  ) : (
                    <div>
                      Upgrade to <strong>Pro</strong> to access Pro cloud
                      servers.
                      <br />
                      <Button
                        onClick={() => open("https://mcp-linker.store/pricing")}
                        className="mt-2"
                      >
                        See Plans
                      </Button>
                    </div>
                  )
                ) : !encryptionKey ? (
                  <Button onClick={() => navigate("/settings")}>
                    go to generate Encryption Key
                  </Button>
                ) : (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    Please log in to view your personal cloud servers. 
                    <Button onClick={() => navigate("/auth")} className="mt-2">Login</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* team */}
          <TabsContent value="team" className="flex-1 min-h-0">
            {user?.tier !== "TEAM" ? (
              <div className="flex flex-col justify-center items-center h-full text-center space-y-3 text-muted-foreground">
                <p>
                  Access to team cloud servers requires a <strong>TEAM</strong> upgrade.
                </p>
                <p className="text-sm font-semibold text-orange-500">
                  Don’t let your team wait.
                </p>
                <Button
                  onClick={() => open("https://mcp-linker.store/pricing")}
                  className="mt-2"
                >
                  See Plans
                </Button>
              </div>
            ) : (
              <Tabs
                value={teamTab}
                onValueChange={setTeamTab}
                className="h-full flex flex-col"
              >
                <div className="flex items-center space-x-4">
                  <TabsList className="flex space-x-2 bg-secondary rounded-md p-1">
                    <TabsTrigger
                      value="teamLocal"
                      className="whitespace-nowrap"
                    >
                      Local
                    </TabsTrigger>
                    <TabsTrigger
                      value="teamCloud"
                      className="flex items-center space-x-1 whitespace-nowrap"
                    >
                      <Cloud />
                      <span>Cloud</span>
                    </TabsTrigger>
                  </TabsList>

                  <span className="whitespace-nowrap font-semibold">Team</span>
                  <TeamSelector />
                  <ConfigFileSelector />
                </div>
                <TabsContent value="teamLocal" className="flex-1 min-h-0">
                  <TeamLocalTable />
                </TabsContent>
                <TabsContent value="teamCloud" className="flex-1 min-h-0">
                  {!isAuthenticated ? (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      Please log in to view your team cloud servers.
                    </div>
                  ) : !selectedTeamId ? (
                    <div className="flex flex-col justify-center items-center h-full text-muted-foreground space-y-4">
                      <p>
                        No team selected. Please select a team or create one.
                      </p>
                      <button
                        onClick={() => navigate("/team")}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      >
                        Go to Teams
                      </button>
                    </div>
                  ) : userLoading ? (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                      Loading user info...
                    </div>
                  ) : (
                    <TeamCloudTable />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <ServerTemplateDialog
        isOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isSell={false}
      />
    </div>
  );
}
