import { create } from "zustand";

interface TeamState {
  selectedTeamId: string;
  selectedTeamName: string;
  setSelectedTeam: (id: string, name: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  selectedTeamId: "",
  selectedTeamName: "",
  setSelectedTeam: (id, name) =>
    set({ selectedTeamId: id, selectedTeamName: name }),
}));
