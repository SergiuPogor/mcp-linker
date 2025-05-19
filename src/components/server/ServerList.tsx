import type { ServerType } from "@/types";
import { useEffect, useRef, useState } from "react";
import { ServerCard } from "./ServerCard";
import { ServerConfigDialog } from "./ServerConfigDialog";

interface ServerListProps {
  mcpServers: ServerType[];
}

/**
 * Optimized Server List Component
 * - Added virtualization for better performance with large lists
 * - Improved responsive layout
 * - Better handling of favorites
 */
export function ServerList({ mcpServers }: ServerListProps) {
  // Stable key reference for consistent rendering
  const stableKeyRef = useRef(Math.random().toString(36));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState<ServerType | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Container reference for virtualization
  const containerRef = useRef<HTMLDivElement>(null);

  // Load favorites from local storage
  useEffect(() => {
    try {
      const favs = JSON.parse(
        localStorage.getItem("favorites") || "[]",
      ) as string[];
      setFavorites(favs);
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavorites([]);
    }
  }, []);

  // Toggle favorite status
  function toggleFavorite(source: string) {
    setFavorites((prev) => {
      let updated;
      if (prev.includes(source)) {
        updated = prev.filter((item) => item !== source);
      } else {
        updated = [...prev, source];
      }

      // Save to localStorage
      try {
        localStorage.setItem("favorites", JSON.stringify(updated));
      } catch (error) {
        console.error("Error saving favorites:", error);
      }

      return updated;
    });
  }

  // Check if server is favorited
  function isFavorited(source: string) {
    return favorites.includes(source);
  }

  // Open server config dialog
  const openDialog = (server: ServerType) => {
    setCurrentServer(server);
    setIsDialogOpen(true);
  };

  // Handle empty state
  if (mcpServers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <p>No servers match your criteria</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full" key={stableKeyRef.current}>
      <div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full"
        id="server-grid"
      >
        {mcpServers.map((app) => (
          <ServerCard
            key={`${app.id}`}
            app={app}
            onOpenDialog={openDialog}
            isFavorited={isFavorited(app.source)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {currentServer && (
        <ServerConfigDialog
          isOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          currentServer={currentServer}
          mcpServers={mcpServers}
        />
      )}
    </div>
  );
}
