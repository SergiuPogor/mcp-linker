import { EmptyState } from "@/components/manage/EmptyState";
import { TeamCloudMcpTable } from "@/components/manage/team/TeamCloudMcpTable";
import { TeamLocalMcpTable } from "@/components/manage/team/TeamLocalMcpTable";
import { TeamSelector } from "@/components/manage/team/TeamSelector";
import { ConfigFileSelector } from "@/components/settings/ConfigFileSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud } from "lucide-react";

interface TeamMcpSectionProps {
  teamTab: string;
  setTeamTab: (tab: string) => void;
  isAuthenticated: boolean;
  teamCount: number;
  selectedTeamId: string | null;
  userLoading: boolean;
  hasTrial: boolean;
  isTeamUser: boolean;
  navigate: (to: string) => void;
}

export function TeamMcpSection({
  teamTab,
  setTeamTab,
  isAuthenticated,
  teamCount,
  selectedTeamId,
  userLoading,
  hasTrial,
  isTeamUser,
  navigate,
}: TeamMcpSectionProps) {
  return (
    <Tabs
      value={teamTab}
      onValueChange={setTeamTab}
      className="h-full flex flex-col"
    >
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

        {(hasTrial || isTeamUser) && teamCount > 0 && (
          <>
            <span>Team</span>
            <TeamSelector />
            <ConfigFileSelector />
          </>
        )}
      </div>
      
      <TabsContent value="teamLocal" className="flex-1 min-h-0">
        <TeamLocalMcpTable />
      </TabsContent>
      
      <TabsContent value="teamCloud" className="flex-1 min-h-0">
        {!isAuthenticated ? (
          <EmptyState
            description="Please log in to view your team cloud servers."
          />
        ) : teamCount === 0 || !selectedTeamId ? (
          <EmptyState
            description={teamCount === 0 
              ? "No teams found. Create your first team to get started."
              : "No team selected. Please select a team or create one."}
            buttonText={teamCount === 0 ? "Create first team" : "Go to Teams"}
            onButtonClick={() => navigate("/team")}
          />
        ) : userLoading ? (
          <EmptyState
            description="Loading user info..."
          />
        ) : (
          <div>
            <TeamCloudMcpTable />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}