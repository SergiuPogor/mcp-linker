import { CatalogCard } from "@/components/common/CatalogCard";
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
    <CatalogCard
      icon={<PluginIcon name={title} icon={entry.icon} iconUrl={entry.iconUrl} />}
      title={title}
      description={entry.description}
      onOpen={onOpen}
      action={
        entry.installed ? (
          <Switch checked={entry.enabled} disabled={busy} onCheckedChange={onToggle} aria-label={t("plugins.enabled")} />
        ) : (
          <Button variant="outline" size="icon" className="size-8" disabled={busy} aria-label={t("install")} title={t("install")} onClick={onInstall}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          </Button>
        )
      }
    />
  );
}
