import { AuthPromptDialog } from "@/components/AuthPromptDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { fetchMyTeams } from "@/services/teamService";
import { useTeamStore } from "@/stores/team";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TeamOption {
  id: string;
  name: string;
}

export function TeamSelector() {
  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const selectedTeamId = useTeamStore((state) => state.selectedTeamId);
  const setSelectedTeam = useTeamStore((state) => state.setSelectedTeam);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const { isAuthenticated, sessionCheckComplete } = useAuth();

useEffect(() => {
  if (!sessionCheckComplete) return;

  if (!isAuthenticated) {
    setIsAuthPromptOpen(true);
    return;
  }

  async function loadData() {
    try {
      const teams = await fetchMyTeams();
      setTeamOptions(teams);

      // Set first team as selected if no team is currently selected
      if (teams.length > 0 && !selectedTeamId) {
        setSelectedTeam(teams[0].id, teams[0].name);
      }
    } catch (error) {
      toast.error("Failed to load teams");
    }
  }

  loadData();
}, [isAuthenticated, sessionCheckComplete, selectedTeamId, setSelectedTeam]);

  return (
    <div className="z-50">
      <Select
        value={selectedTeamId}
        onValueChange={(value) => {
          const selected = teamOptions.find((t) => t.id === value);
          if (selected) {
            setSelectedTeam(selected.id, selected.name);
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
          {teamOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AuthPromptDialog
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
      />
    </div>
  );
}
