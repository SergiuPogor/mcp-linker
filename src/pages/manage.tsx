import { LocalTable } from "@/components/manage/LocalTable";
import { PersonalCloudTable } from "@/components/manage/PersonalCloudTable";
import { TeamCloudTable } from "@/components/manage/team/TeamCloudTable";
import { TeamLocalTable } from "@/components/manage/team/TeamLocalTable";
import { TeamSelector } from "@/components/manage/team/TeamSelector";
import { ConfigFileSelector } from "@/components/settings/ConfigFileSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useTabStore } from "@/stores/tabStore";
import { useTeamStore } from "@/stores/team";
import { getEncryptionKey } from "@/utils/encryption";
import { Cloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function McpManage() {
  const { mainTab, personalTab, teamTab, setMainTab, setPersonalTab, setTeamTab } = useTabStore();
  const { isAuthenticated } = useAuth();
  const { selectedTeamId } = useTeamStore();
  const [encryptionKey, setEncryptionKey] = useState<string|null>(null)
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchKey() {
      const key = getEncryptionKey();
      setEncryptionKey(key);
    }
    fetchKey();
  }, []);

  return (
    <div className="p-4 bg-background text-foreground">
      <Tabs value={mainTab} onValueChange={setMainTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">MCP Server Management</h1>
          <TabsList className="grid grid-cols-2 gap-2 bg-secondary">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-h-0">
          {/* personal */}
          <TabsContent value="personal" className="flex-1 min-h-0">
            <Tabs value={personalTab} onValueChange={setPersonalTab} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 gap-2 bg-secondary">
                <TabsTrigger value="personalLocal">Local</TabsTrigger>
                <TabsTrigger value="personalCloud">
                  <Cloud />
                  Cloud
                </TabsTrigger>
              </TabsList>
              <TabsContent value="personalLocal" className="flex-1 min-h-0">
                <LocalTable />
              </TabsContent>
              <TabsContent value="personalCloud" className="flex-1 min-h-0">
                {isAuthenticated ? (
                  <PersonalCloudTable />
                ) : encryptionKey ? (
                  <button onClick={() => navigate("/settings")}>go to generate Encryption Key</button>
                  ) : (
                  <div className="flex justify-center items-center h-full text-muted-foreground">
                    Please log in to view your personal cloud servers.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* team */}
          <TabsContent value="team" className="flex-1 min-h-0">
            <Tabs value={teamTab} onValueChange={setTeamTab} className="h-full flex flex-col">
              <div className="flex items-center space-x-4">
                <TabsList className="flex space-x-2 bg-secondary rounded-md p-1">
                  <TabsTrigger value="teamLocal" className="whitespace-nowrap">
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
                    <p>No team selected. Please select a team or create one.</p>
                    <button 
                      onClick={() => navigate("/team")}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Go to Teams
                    </button>
                  </div>
                ) : (
                  <TeamCloudTable />
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
