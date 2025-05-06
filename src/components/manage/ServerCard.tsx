import { useState } from "react";
import { PenSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ServerForm } from "./ServerForm";
import { ConfigType } from "@/types/config";
import { SseConfig, StdioServerConfig } from "@/types";

interface ServerCardProps {
  serverKey: string;
  config: ConfigType["mcpServers"][string];
  onUpdate: (key: string, config: ConfigType["mcpServers"][string]) => void;
  onDelete: (key: string) => void;
}

export function ServerCard({
  serverKey,
  config,
  onUpdate,
  onDelete,
}: ServerCardProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete(serverKey);
    setDeleteDialogOpen(false);
  };

  // Display appropriate information based on the server config type
  const getServerDetails = () => {
    if ("command" in config) {
      // It's a StdioServerConfig
      return (
        <div className="flex flex-col">
          <span className="font-medium">Command:</span>
          <span className="text-muted-foreground break-words">
            {(config as StdioServerConfig).command}
          </span>
        </div>
      );
    } else if ("url" in config) {
      // It's an SseConfig
      return (
        <div className="flex flex-col">
          <span className="font-medium">URL:</span>
          <span className="text-muted-foreground break-words">
            {(config as SseConfig).url}
          </span>
          <span className="font-medium mt-1">Type:</span>
          <span className="text-muted-foreground break-words">
            {(config as SseConfig).type}
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{serverKey}</CardTitle>
        <div className="flex space-x-1">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <PenSquare className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Edit {serverKey}
                </DialogTitle>
              </DialogHeader>
              <ServerForm
                config={config}
                onSubmit={(values) => {
                  onUpdate(serverKey, values);
                  setOpen(false);
                }}
                buttonName={"Save"}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-background dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete {serverKey}?
              </p>
              <DialogFooter className="mt-4 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {getServerDetails()}
        </div>
      </CardContent>
    </Card>
  );
}
