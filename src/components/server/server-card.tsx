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
import { Flame, Github, Star, StarOff } from "lucide-react";
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
  return (
    <Card
      key={`${app.name}-${app.source}`}
      className="hover:shadow-lg transition-shadow relative py-2"
    >
      <CardHeader className="px-2 py-2 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-start">
            <div className="p-2 bg-gray-100 rounded-full">
              <Github size={18} />
            </div>
            <div>
              <CardTitle className="text-base">{app.name}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                by {app.developer}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {app.is_hot && (
              <Flame size={16} className="text-orange-500" />
            )}
            <button
              className="text-yellow-500 hover:text-yellow-600 active:scale-110 transition-transform z-20"
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

      <CardFooter className="px-4 pb-4">
        <Button
          className="w-full"
          onClick={() => onOpenDialog(app)}
          variant="default"
        >
          {t("get")}
        </Button>
      </CardFooter>
    </Card>
  );
}
