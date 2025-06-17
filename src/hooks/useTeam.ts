import { useToast } from "@/hooks/use-toast";
import {
  createTeam,
  deleteTeam,
  fetchMyTeams,
  updateTeam,
} from "@/services/teamService";
import { TeamFormData, TeamWithRoleResponse } from "@/types/team";
import { useState } from "react";

export function useTeam() {
  const [teams, setTeams] = useState<TeamWithRoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithRoleResponse | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuideDialog, setShowGuideDialog] = useState(false);
  const [newlyCreatedTeam, setNewlyCreatedTeam] = useState<string>("");
  const { toast } = useToast();

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const teamsData = await fetchMyTeams();
      console.log("teams: ", teamsData);
      setTeams(teamsData);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teams. Please try again.",
        variant: "destructive",
      });
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTeam(formData.name, formData.description);

      const teamName = formData.name.trim();
      setNewlyCreatedTeam(teamName);

      setIsCreateOpen(false);
      setFormData({ name: "", description: "" });
      await fetchTeams();

      setShowGuideDialog(true);
    } catch (error) {
      console.error("Failed to create team:", error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTeam = async () => {
    if (!editingTeam || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTeam(editingTeam.id, formData.name, formData.description);

      toast({
        title: "Success",
        description: "Team updated successfully.",
      });

      setIsEditOpen(false);
      setEditingTeam(null);
      setFormData({ name: "", description: "" });
      fetchTeams();
    } catch (error) {
      console.error("Failed to update team:", error);
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);

      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });

      fetchTeams();
    } catch (error) {
      console.error("Failed to delete team:", error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (team: TeamWithRoleResponse) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || "",
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingTeam(null);
  };

  return {
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
    fetchMyTeams: fetchTeams,
    handleCreateTeam,
    handleEditTeam,
    handleDeleteTeam,
    openEditDialog,
    resetForm,
  };
}
