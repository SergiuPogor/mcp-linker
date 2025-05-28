import { PageLoadingFallback } from "@/components/common/LoadingConfig";
import { ServerList } from "@/components/server";
import { useFavoriteServers } from "@/stores/favoriteServers";
import { useEffect } from "react";

export default function FavoritesPage() {
  const { favoriteServers, isLoading, error, fetchFavorites } =
    useFavoriteServers();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
      {isLoading ? (
        <PageLoadingFallback />
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          Failed to load favorites:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : favoriteServers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No favorite servers yet. Add some servers to your favorites to see
          them here.
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Found {favoriteServers.length} favorite server
            {favoriteServers.length !== 1 ? "s" : ""}
          </div>
          <ServerList mcpServers={favoriteServers} />
        </>
      )}
    </div>
  );
}
