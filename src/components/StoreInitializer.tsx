import { useFavoritesStore } from "@/store/favoritesStore";
import { useEffect } from "react";

/**
 * Component to initialize stores on app startup
 */
export function StoreInitializer() {
  const { loadFavorites } = useFavoritesStore();

  useEffect(() => {
    // Initialize favorites from localStorage
    loadFavorites();
  }, [loadFavorites]);

  return null; // This component doesn't render anything
}
