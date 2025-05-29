import { PageLoadingFallback } from "@/components/common/LoadingConfig";
import { ServerList } from "@/components/server";
import { useFavoriteServers } from "@/stores/favoriteServers";
import { useEffect } from "react";

export default function FavoritesPage() {
  const { favoriteServers, isLoading, error, fetchFavorites } = useFavoriteServers();

  // Fetch favorites when component mounts
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (isLoading) {
    return <PageLoadingFallback />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
      {error ? (
        <div className="text-center py-8 text-red-500">
          Failed to load favorites:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : favoriteServers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No favorite servers yet
        </div>
      ) : (
        <ServerList mcpServers={favoriteServers} />
      )}
    </div>
  );
}
