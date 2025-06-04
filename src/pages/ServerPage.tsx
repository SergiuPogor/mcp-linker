import { ContentLoadingFallback } from "@/components/common/LoadingConfig";
import { ServerConfigDialog } from "@/components/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { ServerType } from "@/types";
import { openUrl } from "@/utils/urlHelper";
import { Download, Eye, Github, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function ServerPage() {
  const [server, setServer] = useState<ServerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (id) {
          const serverResponse = await api.get(`/servers/${id}`);
          setServer(serverResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <ContentLoadingFallback />;
  }

  if (!server) {
    return <div>Server not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{server.name}</span>
            {server.isOfficial ? (
              <Badge variant="secondary" className="uppercase">
                Official
              </Badge>
            ) : (
              <Badge variant="outline" className="uppercase">
                Community
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{server.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span>{server.developer}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={16} />
              <span>{server.rating?.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Github size={16} />
              <span>{server.githubStars?.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download size={16} />
              <span>{server.downloads.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye size={16} />
              <span>{server.views?.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => openUrl(server.source)}
              className="flex items-center space-x-2"
            >
              <span>View Source</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center space-x-2"
            >
              get
            </Button>
          </div>
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
