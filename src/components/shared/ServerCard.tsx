import { BaseServerCard } from "@/components/shared/BaseServerCard";
import { ServerDetails } from "@/components/shared/ServerDetails";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfigType } from "@/types/config";
import { Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";

export interface ServerCardProps {
  serverKey: string;
  config: ConfigType["mcpServers"][string];
  onDelete: (key: string) => void;
  primaryAction?: ReactNode;
  contentClassName?: string;
}

export function ServerCard({
  serverKey,
  config,
  onDelete,
  primaryAction,
  contentClassName,
}: ServerCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { t } = useTranslation();

  const handleDeleteConfirm = () => {
    onDelete(serverKey);
    setDeleteDialogOpen(false);
  };

  return (
    <BaseServerCard
      title={serverKey}
      actions={
        <div className="flex space-x-1">
          {primaryAction}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t("delete")}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  {t("confirmDeletion")}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                {t("deleteConfirmation", { serverKey })}
              </p>
              <DialogFooter className="mt-4 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="mr-2"
                >
                  {t("cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  {t("delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
      contentClassName={contentClassName}
    >
      <div className="space-y-2 text-sm">
        <ServerDetails config={config} />
      </div>
    </BaseServerCard>
  );
}
