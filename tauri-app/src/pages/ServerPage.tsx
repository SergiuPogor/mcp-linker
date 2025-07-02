import { ContentLoadingFallback } from "@/components/common/LoadingConfig";
import { ServerConfigDialog } from "@/components/server";
import { ServerActions, ServerBadge, ServerMeta } from "@/components/server/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ServerType } from "@/types";
import { Download, Eye, Github, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function ServerPage() {
  const [server, setServer] = useState<ServerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchServer = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const res = await api.get(`/servers/${id}`);
          setServer(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServer();
  }, [id]);

  if (isLoading) return <ContentLoadingFallback />;
  if (!server) return <div>Server not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{server.name}</span>
            <ServerBadge isOfficial={server.isOfficial} />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{server.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <ServerMeta icon={User} value={server.developer} />
            <ServerMeta icon={Star} value={server.rating?.toFixed(1)} />
            <ServerMeta icon={Github} value={server.githubStars} />
            <ServerMeta icon={Download} value={server.downloads} />
            <ServerMeta icon={Eye} value={server.views} />
          </div>

          <ServerActions
            source={server.source}
            onGetClick={() => setIsDialogOpen(true)}
          />
        </CardContent>
      </Card>

      <ServerConfigDialog
        isOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        currentServer={server}
      />
    </div>
  );
}
