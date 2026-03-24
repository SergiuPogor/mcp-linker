import { TeamTrialSection } from "@/components/manage/TeamTrialSection";
import { TeamMcpSection } from "@/components/manage/TeamMcpSection";
import { useTeamColumns } from "@/components/team/TeamColumns";
import { TeamForm } from "@/components/team/TeamForm";
import { TeamMembersGuideDialog } from "@/components/team/TeamMembersGuideDialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useTeam } from "@/hooks/useTeam";
import { useTeamTrial } from "@/hooks/useTeamTrial";
import { useTeamTrialStatus } from "@/hooks/useTeamTrialStatus";
import { fetchMyTeams as fetchMyTeamsService } from "@/services/teamService";
import { useTabStore } from "@/stores/tabStore";
import { useTeamStore } from "@/stores/team";
import { useUserStore } from "@/stores/userStore";
import { RowSelectionState } from "@tanstack/react-table";
import { open } from "@tauri-apps/plugin-shell";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeamPage() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const navigate = useNavigate();
  const { user, loading: userLoading, fetchUser } = useUserStore();
  const { isAuthenticated } = useAuth();
  const { selectedTeamId } = useTeamStore();
  const { teamTab, setTeamTab } = useTabStore();
  const [teamCount, setTeamCount] = useState(0);

  // Use custom hook to get team trial logic
  const {
    loading: teamTrialLoading,
    isEligibleForTrial,
    startTrial,
  } = useTeamTrial();

  // Use custom hook to get team/trial status
  const { hasTrial, isTeamUser, isTeamOrTrialActive } = useTeamTrialStatus(user);

  const {
    teams,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    isEditOpen,
    setIsEditOpen,
    formData,
    setFormData,
    isSubmitting,
    showGuideDialog,
    setShowGuideDialog,
    newlyCreatedTeam,
    fetchMyTeams,
    handleCreateTeam,
    handleEditTeam,
    handleDeleteTeam,
    openEditDialog,
    resetForm,
  } = useTeam();

  const columns = useTeamColumns({
    onEdit: openEditDialog,
    onDelete: handleDeleteTeam,
    navigateToMembers: (teamId) => navigate(`/teams/${teamId}/members`),
  });

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (isTeamOrTrialActive) {
      fetchMyTeams();
    }
  }, [user]);

  // Load team count for reliable team management UI
  useEffect(() => {
    async function loadTeamCount() {
      if (isAuthenticated && isTeamOrTrialActive) {
        try {
          const fetchedTeams = await fetchMyTeamsService();
          setTeamCount(fetchedTeams.length);
        } catch (error) {
          setTeamCount(0);
        }
      }
    }
    loadTeamCount();
  }, [isAuthenticated, isTeamOrTrialActive]);

  if (userLoading) {
    return <div className="p-6 text-center">Loading user info...</div>;
  }

  return (
    <main className="bg-white dark:bg-black rounded-t-3xl min-h-[60vh] py-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Team Management
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchMyTeams}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {isTeamOrTrialActive ? (
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            ) : null}
            <Button
              onClick={() => {
                navigate("/manage");
              }}
            >
              Manage Personal Servers
            </Button>
          </div>
        </div>

        <Tabs defaultValue="teams" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-2 gap-2 bg-secondary mb-4">
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="servers">Team Servers</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="flex-1 min-h-0">
            {isTeamOrTrialActive ? (
              <DataTable
                columns={columns}
                data={teams}
                isLoading={isLoading}
                searchPlaceholder="Search teams..."
                emptyMessage="No teams found. Create your first team or ask to be added to an existing team."
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
              />
            ) : teamTrialLoading ? (
              <div className="flex items-center text-sm text-muted-foreground animate-pulse">
                ✨ Activating Team Trial...
              </div>
            ) : isEligibleForTrial ? (
              <Button
                variant="outline"
                onClick={startTrial}
                disabled={teamTrialLoading}
              >
                Start 14-day free Team Trial, No credit card required
              </Button>
            ) : (
              <div className="border p-6 text-center rounded-lg text-muted-foreground">
                <p>Your free trial has ended. Upgrade to continue using teams.</p>
                <Button
                  className="mt-4"
                  onClick={() => open("https://mcp-linker.store/pricing")}
                >
                  Upgrade to Team
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="servers" className="flex-1 min-h-0">
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
        </Tabs>

        <TeamForm
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateTeam}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          title="Create New Team"
          description="Create a new team to collaborate with your colleagues."
          submitButtonText="Create Team"
        />

        <TeamForm
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          onSubmit={handleEditTeam}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          title="Edit Team"
          description="Update your team information."
          submitButtonText="Update Team"
        />

        <TeamMembersGuideDialog
          isOpen={showGuideDialog}
          onOpenChange={setShowGuideDialog}
          newlyCreatedTeamName={newlyCreatedTeam}
          onAddMembersNow={() => {
            setShowGuideDialog(false);
            const team = teams.find((t) => t.name === newlyCreatedTeam);
            if (team) {
              navigate(`/teams/${team.id}/members`);
            }
          }}
        />
      </div>
    </main>
  );
}
