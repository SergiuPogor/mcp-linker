import supabase from "@/utils/supabase";
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

function rowToServerType(s: any): ServerType {
  return {
    id: s.id,
    name: s.name,
    developer: s.developer,
    logoUrl: s.logo_url,
    description: s.description,
    source: s.source,
    isOfficial: s.is_official,
    githubStars: s.github_stars,
    downloads: s.downloads,
    rating: s.rating,
    views: s.views,
    isFavorited: true,
    tags: s.tags,
  };
}

export const useFavoriteServers = create<FavoriteServersState>((set, get) => ({
  favoriteServers: [],
  isLoading: false,
  error: null,
  initialized: false,

  toggleFavorite: async (server: ServerType) => {
    if (!supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const currentFavorites = get().favoriteServers;
    const isFavorited = currentFavorites.some((s) => s.id === server.id);

    try {
      if (isFavorited) {
        await supabase
          .from("user_favorite_servers")
          .delete()
          .eq("user_id", session.user.id)
          .eq("server_id", server.id);
        set({
          favoriteServers: currentFavorites.filter((s) => s.id !== server.id),
        });
      } else {
        await supabase
          .from("user_favorite_servers")
          .upsert({ user_id: session.user.id, server_id: server.id });
        set({ favoriteServers: [...currentFavorites, server] });
      }
    } catch (error) {
      set({ error: error as Error });
      throw error;
    }
  },

  fetchFavorites: async () => {
    if (get().initialized || !supabase) return;

    set({ isLoading: true, error: null });
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        set({ favoriteServers: [], isLoading: false, initialized: true });
        return;
      }

      const { data, error } = await supabase
        .from("user_favorite_servers")
        .select("servers(*)")
        .eq("user_id", session.user.id);

      if (error) throw new Error(error.message);

      const servers = (data || [])
        .map((row: any) => row.servers)
        .filter(Boolean)
        .map(rowToServerType);

      set({ favoriteServers: servers, isLoading: false, initialized: true });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
}));
