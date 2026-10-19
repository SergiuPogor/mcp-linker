import { ClientIcon } from "@/components/ClientIcon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { CatalogEntry } from "@/lib/plugins";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PluginIcon } from "./PluginIcon";

/** One plugin in the list: logo, name, description, and a switch (installed) or + (not). */
export function PluginItem({
  entry,
  busy,
  onOpen,
  onToggle,
  onInstall,
  copy,
}: {
  entry: CatalogEntry;
  busy: boolean;
  onOpen: () => void;
  onToggle: (enabled: boolean) => void;
  onInstall: () => void;
  /** Copies this (installed) plugin to the other client. */
  copy: { label: string; clientId: string; pending: boolean; run: () => void };
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1 px-2" disabled={copy.pending} title={t("plugins.copyTo", { client: copy.label })} onClick={copy.run}>
              {copy.pending ? <Loader2 className="size-3.5 animate-spin" /> : <ArrowRight className="size-3.5" />}
              <ClientIcon client={copy.clientId} className="size-4" />
            </Button>
            <Switch checked={entry.enabled} disabled={busy} onCheckedChange={onToggle} aria-label={t("plugins.enabled")} />
          </div>
        ) : (
          <Button variant="ghost" size="icon" disabled={busy} aria-label={t("install")} title={t("install")} onClick={onInstall}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
