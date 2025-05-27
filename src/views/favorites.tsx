import { ServerList } from "@/components/server";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useServerStore } from "@/store/serverStore";
import { useEffect } from "react";

export default function FavoritesPage() {
  const { servers, isLoading, error, loadServers } = useServerStore();
  const { favorites, loadFavorites } = useFavoritesStore();

  useEffect(() => {
    // Load favorites from localStorage
    loadFavorites();

    // Load servers if not already loaded
    loadServers();
  }, [loadFavorites, loadServers]);

  // Filter servers to show only favorites
  const favoriteServers = servers.filter((server) =>
    favorites.includes(server.source),
  );

  if (isLoading && servers.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
        <div className="text-center py-8 text-red-500">
          Error loading servers: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
      {favoriteServers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No favorite servers yet. Add some servers to your favorites to see
          them here.
        </div>
      ) : (
        <ServerList mcpServers={favoriteServers} />
      )}
    </div>
  );
}
