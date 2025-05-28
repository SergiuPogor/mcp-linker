import { ContentLoadingFallback } from "@/components/common/LoadingConfig";
import { ServerList } from "@/components/server";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function FavoritesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const response = await api.get("/servers/favorites");
      return response.data;
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
      {isLoading ? (
        <ContentLoadingFallback />
      ) : error ? (
        <div className="text-center py-8 text-red-500">Failed to load favorites.</div>
      ) : data.servers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No favorite servers yet. Add some servers to your favorites to see
          them here.
        </div>
      ) : (
        <ServerList mcpServers={data.servers} />
      )}
    </div>
  );
}
