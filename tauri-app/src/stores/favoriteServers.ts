import { api } from "@/lib/api";
import type { ServerType } from "@/types";
import { create } from "zustand";

interface FavoriteServersState {
  favoriteServers: ServerType[];
  isLoading: boolean;
  error: Error | null;
  toggleFavorite: (server: ServerType) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  initialized: boolean;
}

export const useFavoriteServers = create<FavoriteServersState>((set, get) => ({
  favoriteServers: [],
  isLoading: false,
  error: null,
  initialized: false,

  toggleFavorite: async (server: ServerType) => {
    try {
      const currentFavorites = get().favoriteServers;
      const isFavorited = currentFavorites.some((s) => s.id === server.id);

      if (isFavorited) {
        // Remove from favorites
        await api.delete(`/servers/favorites/${server.id}`);
        set({
          favoriteServers: currentFavorites.filter((s) => s.id !== server.id),
        });
      } else {
        // Add to favorites
        await api.post(`/servers/favorites/${server.id}`);
        set({ favoriteServers: [...currentFavorites, server] });
      }
    } catch (error) {
      set({ error: error as Error });
      throw error;
    }
  },

  fetchFavorites: async () => {
    if (get().initialized) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/servers/favorites/");
      const data = Array.isArray(response.data) ? response.data : [];
      set({ favoriteServers: data, isLoading: false, initialized: true });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
}));
