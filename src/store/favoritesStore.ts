import { create } from "zustand";

interface FavoritesState {
  favorites: string[]; // Array of server sources

  // Actions
  addFavorite: (serverSource: string) => void;
  removeFavorite: (serverSource: string) => void;
  toggleFavorite: (serverSource: string) => void;
  isFavorite: (serverSource: string) => boolean;
  loadFavorites: () => void;
}

const FAVORITES_KEY = "favorites";

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  addFavorite: (serverSource: string) => {
    const currentFavorites = get().favorites;
    if (!currentFavorites.includes(serverSource)) {
      const newFavorites = [...currentFavorites, serverSource];
      set({ favorites: newFavorites });
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    }
  },

  removeFavorite: (serverSource: string) => {
    const currentFavorites = get().favorites;
    const newFavorites = currentFavorites.filter((fav) => fav !== serverSource);
    set({ favorites: newFavorites });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  },

  toggleFavorite: (serverSource: string) => {
    const { isFavorite, addFavorite, removeFavorite } = get();
    if (isFavorite(serverSource)) {
      removeFavorite(serverSource);
    } else {
      addFavorite(serverSource);
    }
  },

  isFavorite: (serverSource: string) => {
    return get().favorites.includes(serverSource);
  },

  loadFavorites: () => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      const favorites = stored ? JSON.parse(stored) : [];
      set({ favorites });
    } catch (error) {
      console.error("Failed to load favorites:", error);
      set({ favorites: [] });
    }
  },
}));
