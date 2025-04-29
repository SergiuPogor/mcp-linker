import { useEffect, useState } from "react";
import { fetchServers } from "@/lib/api";
import type { ServerType } from "@/types";
import { ServerList } from "@/components/server/server-list";

interface Props {
  selectedApp: string;
  selectedPath: string;
}

export default function FavoritesPage({ selectedApp, selectedPath }: Props) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [serverList, setServerList] = useState<{ servers: ServerType[] }>({
    servers: [],
  });

  useEffect(() => {
    fetchServers()
      .then((data) => setServerList(data))
      .catch((err) => console.error("Failed to load servers", err));
  }, []);

  useEffect(() => {
    const favs = JSON.parse(
      localStorage.getItem("favorites") || "[]",
    ) as string[];
    setFavorites(favs);
  }, []);

  const favoriteServers = serverList.servers.filter((server) =>
    favorites.includes(server.source),
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
      <ServerList
        selectedApp={selectedApp}
        selectedPath={selectedPath}
        mcpServers={favoriteServers}
      />
    </div>
  );
}
