import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ServerType } from "@/types";
import { openUrl } from "@/utils/urlHelper";
import { Github, SquareArrowOutUpRight, Star, StarOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ServerCardProps {
  app: ServerType;
  onOpenDialog: (server: ServerType) => void;
  isFavorited: boolean;
  onToggleFavorite: (source: string) => void;
}

export function ServerCard({
  app,
  onOpenDialog,
  isFavorited,
  onToggleFavorite,
}: ServerCardProps) {
  const { t } = useTranslation();

  const showGithubIcon =
    app.source && app.source.startsWith("https://github.com");

  return (
    <Card
      key={`${app.name}-${app.source}`}
      className="hover:shadow-lg transition-shadow relative py-2"
    >
      <CardHeader className="px-2 py-2 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-start">
            <div className="p-2 bg-gray-100 rounded-full">
              {showGithubIcon && <Github size={18} />}
            </div>
            <div>
              <CardTitle className="text-base">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openUrl(app.source);
                  }}
                  className="hover:underline text-left flex"
                  title={`open ${app.source}`}
                >
                  {app.name}
                  <SquareArrowOutUpRight size={10} />
                </button>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {app.developer}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              className="absolute top-3 right-3 bg-white/70 rounded-full p-1 hover:bg-yellow-100 transition"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(app.source);
              }}
              title={isFavorited ? "Unfavorite" : "Favorite"}
            >
              {isFavorited ? (
                <Star size={20} className="text-yellow-400" />
              ) : (
                <StarOff size={20} className="text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-0 pb-2 text-sm text-foreground max-h-24 overflow-y-scroll">
        {app.description || ""}
      </CardContent>

      <CardFooter className="flex justify-between px-4 pb-4">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          {app.isOfficial && <span className="text-blue-600">🎖️</span>}
          {app.githubStars !== undefined && <span>⭐ {app.githubStars}</span>}
        </span>
        <Button onClick={() => onOpenDialog(app)} variant="default">
          {t("get")}
        </Button>
      </CardFooter>
    </Card>
  );
}
