import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  useEffect(() => {
    async function loadData() {
      try {
        const teams = await fetchMyTeams();
        setTeamOptions(teams);
        // Optionally set default selected team if needed
        if (teams.length > 0 && !selectedTeamId) {
          setSelectedTeam(teams[0].id, teams[0].name);
        }
      } catch (error) {
        console.error("Failed to load teams:", error);
        toast.error("Failed to load teams");
      }
    }

    loadData();
  }, []);

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
    </div>
  );
}
