import { create } from "zustand";

// Type for personal stats
export type PersonalStats = {
  total: number;
  active: number;
  disabled: number;
};

// Type for team stats
export type TeamStats = {
  total: number;
};

// Zustand store interface
interface StatsState {
  personalStats: PersonalStats;
  setPersonalStats: (stats: PersonalStats) => void;
  teamStats: TeamStats;
  setTeamStats: (stats: TeamStats) => void;
}

// Zustand store for stats
export const useStatsStore = create<StatsState>((set) => ({
  personalStats: { total: 0, active: 0, disabled: 0 },
  setPersonalStats: (stats) => set({ personalStats: stats }),
  teamStats: { total: 0 },
  setTeamStats: (stats) => set({ teamStats: stats }),
}));
