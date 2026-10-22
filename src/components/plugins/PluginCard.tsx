import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { CatalogEntry } from "@/lib/plugins";
import { Loader2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PluginIcon } from "./PluginIcon";

/** One plugin in the list: logo, name, description, and a switch (installed) or + (not). */
export function PluginItem({
  entry,
  busy,
  onOpen,
  onToggle,
  onInstall,
}: {
  entry: CatalogEntry;
  busy: boolean;
  onOpen: () => void;
  onToggle: (enabled: boolean) => void;
  onInstall: () => void;
}) {
  const { t } = useTranslation();
  const title = entry.displayName ?? entry.name;
  return (
    <div role="button" tabIndex={0} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted/60" onClick={onOpen} onKeyDown={event => event.key === "Enter" && onOpen()}>
      <PluginIcon name={title} icon={entry.icon} iconUrl={entry.iconUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{entry.description}</p>
      </div>
      <div onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        {entry.installed ? (
          <Switch checked={entry.enabled} disabled={busy} onCheckedChange={onToggle} aria-label={t("plugins.enabled")} />
        ) : (
          <Button variant="ghost" size="icon" disabled={busy} aria-label={t("install")} title={t("install")} onClick={onInstall}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
