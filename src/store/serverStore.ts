import { fetchServers } from "@/lib/api/servers";
import type { ServerType } from "@/types";
import { create } from "zustand";

interface ServerState {
  servers: ServerType[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;

  // Actions
  loadServers: (forceRefresh?: boolean) => Promise<void>;
  clearError: () => void;
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const useServerStore = create<ServerState>((set, get) => ({
  servers: [],
  isLoading: false,
  error: null,
  lastFetchTime: 0,

  loadServers: async (forceRefresh = false) => {
    const state = get();
    const now = Date.now();

    // Check if we need to refresh
    if (
      !forceRefresh &&
      state.servers.length > 0 &&
      now - state.lastFetchTime < CACHE_DURATION
    ) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Fetch all servers with a large page size to get complete list
      const data = await fetchServers(1, 20);

      set({
        servers: data.servers,
        isLoading: false,
        lastFetchTime: now,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load servers",
      });
    }
  },

  clearError: () => set({ error: null }),
}));
