import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Download, Eye, Github, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface MCPServerDetail {
  id: number;
  name: string;
  description: string;
  source: string;
  developer: string;
  isOfficial: boolean;
  rating: number;
  githubStars: number;
  downloads: number;
  views: number;
}

export function ServerPage() {
  const [server, setServer] = useState<MCPServerDetail>();
  const { id } = useParams();

  useEffect(() => {
    const fetchServer = async (id: number) => {
      try {
        const response = await api.get(`/servers/${id}`);
        setServer(response.data);
      } catch (error) {
        console.error("Failed to fetch server data", error);
      }
    };

    if (id) {
      fetchServer(Number(id));
    }
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{server?.name}</span>
            {server?.isOfficial ? (
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
          <p className="text-muted-foreground">{server?.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User size={16} />
              <span>{server?.developer}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star size={16} />
              <span>{server?.rating?.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Github size={16} />
              <span>{server?.githubStars?.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download size={16} />
              <span>{server?.downloads?.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye size={16} />
              <span>{server?.views?.toLocaleString()}</span>
            </div>
          </div>

          <Link to={server?.source || "#"}>
            <Button
              variant="outline"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <span>View Source</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
