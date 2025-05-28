import { ServerCard as SharedServerCard } from "@/components/shared/ServerCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfigType } from "@/types/mcpConfig";
import { PenSquare } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ServerForm } from "./ServerForm";

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
  const { t } = useTranslation();

  return (
    <SharedServerCard
      serverKey={serverKey}
      config={config}
      onDelete={onDelete}
      primaryAction={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <PenSquare className="h-4 w-4" />
              <span className="sr-only">{t("edit")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                {t("edit")} {serverKey}
              </DialogTitle>
            </DialogHeader>
            <ServerForm
              config={config}
              onSubmit={(values) => {
                onUpdate(serverKey, values);
                setOpen(false);
              }}
              buttonName={t("save")}
            />
          </DialogContent>
        </Dialog>
      }
    />
  );
}
