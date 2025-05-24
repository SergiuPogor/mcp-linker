import { ServerList } from "@/components/server/ServerList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/apiClient";
import { signOut } from "@/services/auth";
import { ServerType } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const {
    data: mcpServers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["myMcpServers"],
    queryFn: async () => {
      const res = await apiClient.get("/servers/my");
      return res.data.servers;
    },
  });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDelete = (id: number) => {
    const server = mcpServers?.find((s: ServerType) => s.id === id);
    const serverName = server?.name || `Server ${id}`;

    setServerToDelete({ id, name: serverName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!serverToDelete) return;

    try {
      await apiClient.delete(`/servers/${serverToDelete.id}`);
      console.log(
        `Successfully deleted server: ${serverToDelete.name} (ID: ${serverToDelete.id})`,
      );
      queryClient.invalidateQueries({ queryKey: ["myMcpServers"] });
      setDeleteDialogOpen(false);
      setServerToDelete(null);
    } catch (error) {
      console.error(
        `Failed to delete server ${serverToDelete.name} (ID: ${serverToDelete.id}):`,
        error,
      );
      alert(`Failed to delete ${serverToDelete.name}. Please try again.`);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setServerToDelete(null);
  };

  return (
    <div className="p-4 space-y-4">
      <Button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 mt-6"
        variant="destructive"
      >
        Logout
      </Button>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error: {error.message}</div>
      ) : (
        <div>
          <h1>My On Sale Servers</h1>
          <ServerList mcpServers={mcpServers} onDelete={handleDelete} />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{serverToDelete?.name}"?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
