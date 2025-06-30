import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TabState {
  // Main tab state (personal/team)
  mainTab: string;
  // Personal section tab state (local/cloud)
  personalTab: string;
  // Team section tab state (local/cloud)
  teamTab: string;
  // Actions
  setMainTab: (tab: string) => void;
  setPersonalTab: (tab: string) => void;
  setTeamTab: (tab: string) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      // Initial states
      mainTab: "personal",
      personalTab: "personalLocal",
      teamTab: "teamLocal",
      // Actions
      setMainTab: (tab) => set({ mainTab: tab }),
      setPersonalTab: (tab) => set({ personalTab: tab }),
      setTeamTab: (tab) => set({ teamTab: tab }),
    }),
    {
      name: "mcp-tab-storage", // unique name for localStorage
    },
  ),
);
