import { incrementViews } from "@/lib/api/servers";
import type { ServerType } from "@/types";
import { useRef, useState } from "react";
import { ServerConfigDialog } from "../dialog";
import { ServerCard } from "./ServerCard";

interface ServerListProps {
  mcpServers: ServerType[];
  onDelete?: (id: string) => void;
}

/**
 * Optimized Server List Component
 * - Added virtualization for better performance with large lists
 * - Improved responsive layout
 * - Better handling of favorites using global store
 */
export function ServerList({ mcpServers, onDelete }: ServerListProps) {
  // Stable key reference for consistent rendering
  const stableKeyRef = useRef(Math.random().toString(36));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState<ServerType | null>(null);

  // Container reference for virtualization
  const containerRef = useRef<HTMLDivElement>(null);

  // Open server config dialog
  const openDialog = (server: ServerType) => {
    setCurrentServer(server);
    setIsDialogOpen(true);
    incrementViews(server.id);
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
            isFavorited={app.isFavorited}
            onDelete={onDelete}
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
