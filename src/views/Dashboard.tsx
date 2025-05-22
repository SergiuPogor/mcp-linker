import { ServerList } from "@/components/server/ServerList";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { signOut } from "@/services/auth";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

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
          <h1>my on sale servers</h1>
          <ServerList mcpServers={mcpServers} />
        </div>
      )}
    </div>
  );
}
