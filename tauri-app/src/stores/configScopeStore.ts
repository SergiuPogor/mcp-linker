import { create } from "zustand";
import { persist } from "zustand/middleware";

// State interface for config scope
interface ConfigScopeState {
  scope: string; // 'personal' or 'team'
  setScope: (scope: string) => void;
}

// Zustand store for config scope, persisted in localStorage
export const useConfigScopeStore = create<ConfigScopeState>()(
  persist(
    (set) => ({
      scope: "personal", // default to personal
      setScope: (scope) => set({ scope }),
    }),
    {
      name: "config-scope-storage", // unique name for localStorage
    },
  ),
);
