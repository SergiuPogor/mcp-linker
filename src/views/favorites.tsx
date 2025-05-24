import { ServerList } from "@/components/server/ServerList";
import { fetchServers } from "@/lib/api/servers";
import type { ServerType } from "@/types";
import { useEffect, useState } from "react";

// Cache for server list
let cachedServerList: { servers: ServerType[] } | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [serverList, setServerList] = useState<{ servers: ServerType[] }>({
    servers: [],
  });

  useEffect(() => {
    const loadData = async () => {
      // Load favorites first
      const favs = JSON.parse(
        localStorage.getItem("favorites") || "[]",
      ) as string[];
      setFavorites(favs);

      // Check if we have cached data that's still valid
      const now = Date.now();
      if (cachedServerList && now - lastFetchTime < CACHE_DURATION) {
        setServerList(cachedServerList);
        return;
      }

      try {
        const data = await fetchServers();
        cachedServerList = data;
        lastFetchTime = now;
        setServerList(data);
      } catch (err) {
        console.error("Failed to load servers", err);
      }
    };

    loadData();
  }, []);

  const favoriteServers = serverList.servers.filter((server) =>
    favorites.includes(server.source),
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
      <ServerList mcpServers={favoriteServers} />
    </div>
  );
}
