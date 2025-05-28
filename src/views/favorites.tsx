import { PageLoadingFallback } from "@/components/common/LoadingConfig";
import { ServerList } from "@/components/server";
import { useAuth } from "@/hooks/useAuth";
import { useFavoriteServers } from "@/stores/favoriteServers";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { favoriteServers, isLoading, error, fetchFavorites } =
    useFavoriteServers();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      fetchFavorites();
    }
  }, [fetchFavorites, user, loading, navigate]);

  if (loading) {
    return <PageLoadingFallback />;
  }

  if (!user) {
    return null;
  }

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
          No favorite servers yet
        </div>
      ) : (
        <ServerList mcpServers={favoriteServers} />
      )}
    </div>
  );
}
