import { create } from "zustand";

// Type for personal stats
export type PersonalStats = {
  total: number;
  active: number;
  disabled: number;
};

// Zustand store interface
interface StatsState {
  personalStats: PersonalStats;
  setPersonalStats: (stats: PersonalStats) => void;
}

// Zustand store for stats
export const useStatsStore = create<StatsState>((set) => ({
  personalStats: { total: 0, active: 0, disabled: 0 },
  setPersonalStats: (stats) => set({ personalStats: stats }),
}));
