import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ConfigType } from "@/types/mcpConfig";
import { PenSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ServerForm } from "./ServerForm";

interface ServerActionButtonsProps {
  serverName: string;
  serverConfig: any;
  onEdit: (
    serverName: string,
    config: ConfigType["mcpServers"][string],
  ) => void;
  onDelete: (serverName: string) => void;
  onEnable: (serverName: string) => Promise<void>;
  disabledServers?: Record<string, any>;
}

export function ServerActionButtons({
  serverName,
  serverConfig,
  onEdit,
  onDelete,
  onEnable,
  disabledServers,
}: ServerActionButtonsProps) {
  const [editingServer, setEditingServer] = useState<string | null>(null);
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {/* Edit Button */}
      <Dialog
        open={editingServer === serverName}
        onOpenChange={(open) => setEditingServer(open ? serverName : null)}
      >
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <PenSquare className="h-4 w-4" />
            <span className="sr-only">{t ? t("edit") : "Edit"}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-background dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {t ? t("edit") : "Edit"} {serverName}
            </DialogTitle>
          </DialogHeader>
          <ServerForm
            config={serverConfig}
            onSubmit={(values) => {
              onEdit(serverName, values);
              setEditingServer(null);
            }}
            buttonName={t ? t("save") : "Save"}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{t ? t("delete") : "Delete"}</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the server "{serverName}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const isDisabled = !!disabledServers?.[serverName];
                if (isDisabled) {
                  await onEnable(serverName);
                  onDelete(serverName);
                } else {
                  onDelete(serverName);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
