import { TeamCloudTable } from "@/components/manage/team/TeamCloudTable";
import { TeamLocalTable } from "@/components/manage/team/TeamLocalTable";
import { TeamSelector } from "@/components/manage/team/TeamSelector";
import { ConfigFileSelector } from "@/components/settings/ConfigFileSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * Props for TeamTabsSection component.
 */
interface TeamTabsSectionProps {
  teamTab: string;
  setTeamTab: (tab: string) => void;
  selectedTeamId: string | null;
  isAuthenticated: boolean;
  userLoading: boolean;
  user: any;
}

/**
 * Component for rendering the team tabs, selectors, and tables.
 */
export function TeamTabsSection({
  teamTab,
  setTeamTab,
  selectedTeamId,
  isAuthenticated,
  userLoading,
}: TeamTabsSectionProps) {
  const navigate = useNavigate();

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

        {selectedTeamId ? (
          <>
            <span className="whitespace-nowrap font-semibold">Team</span>
            <TeamSelector />
            <ConfigFileSelector />
          </>
        ) : (
          <button
            onClick={() => navigate("/team")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Create team
          </button>
        )}
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
        ) : userLoading ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            Loading user info...
          </div>
        ) : (
          <TeamCloudTable />
        )}
      </TabsContent>
    </Tabs>
  );
}
