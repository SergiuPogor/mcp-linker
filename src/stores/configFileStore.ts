import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigFileState {
  teamConfigPaths: Record<string, string>;
  setTeamConfigPath: (teamId: string, path: string) => void;
  getTeamConfigPath: (teamId: string) => string | undefined;
}

export const useConfigFileStore = create<ConfigFileState>()(
  persist(
    (set, get) => ({
      teamConfigPaths: {},
      setTeamConfigPath: (teamId, path) =>
        set((state) => ({
          teamConfigPaths: {
            ...state.teamConfigPaths,
            [teamId]: path,
          },
        })),
      getTeamConfigPath: (teamId) => get().teamConfigPaths[teamId],
    }),
    {
      name: "config-file-storage",
    }
  )
); 