import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TabState {
  // Personal section tab state (local/cloud)
  personalTab: string;
  // Actions
  setPersonalTab: (tab: string) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      // Initial states
      personalTab: "personalLocal",
      // Actions
      setPersonalTab: (tab) => set({ personalTab: tab }),
    }),
    {
      name: "mcp-tab-storage",
    },
  ),
);
