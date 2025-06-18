import { useTeamColumns } from "@/components/team/TeamColumns";
import { TeamForm } from "@/components/team/TeamForm";
import { TeamMembersGuideDialog } from "@/components/team/TeamMembersGuideDialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useTeam } from "@/hooks/useTeam";
import { RowSelectionState } from "@tanstack/react-table";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeamPage() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const navigate = useNavigate();

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
    fetchMyTeams();
  }, []);

  return (
    <main className="bg-white dark:bg-black rounded-t-3xl min-h-[60vh] py-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            All Teams
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
            <Button
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
            <Button
              onClick={() => {
                navigate("/manage")
              }}
            >
              Manage Servers
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={teams}
          isLoading={isLoading}
          searchPlaceholder="Search teams..."
          emptyMessage="No teams found. Create your first team or ask to be added to an existing team."
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />

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
