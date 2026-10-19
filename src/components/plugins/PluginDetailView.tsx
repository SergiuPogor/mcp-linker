import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PLUGIN_CLIENTS, pluginDetails, type CatalogEntry, type PluginClient } from "@/lib/plugins";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRightLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PluginIcon } from "./PluginIcon";
import { usePluginActions } from "./usePluginActions";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));
const labelOf = (client: PluginClient) => PLUGIN_CLIENTS.find(c => c.id === client)?.label ?? client;

export function PluginDetailView({ client, plugin, onBack, onUninstall }: { client: PluginClient; plugin: CatalogEntry; onBack: () => void; onUninstall: () => void }) {
  const { t } = useTranslation();
    const { toggle, install, copy } = usePluginActions(client, labelOf(client));
  const { data, error, isLoading } = useQuery({ queryKey: ["plugin", client, plugin.id], queryFn: () => pluginDetails(client, plugin.id) });
  const title = plugin.displayName ?? plugin.name;

  const servers = data ? Object.entries(data.mcpServers) : [];
  const path = plugin.path;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" />
        {t("plugins.back")}
      </Button>

      <div className="flex items-center gap-4">
        <PluginIcon name={title} icon={plugin.icon} iconUrl={plugin.iconUrl} className="size-12 text-xl" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-semibold">{title}</h2>
          <p className="truncate text-sm text-muted-foreground">{[plugin.marketplace, plugin.version].filter(Boolean).join(" · ")}</p>
        </div>
        {plugin.installed ? (
          <Switch checked={plugin.enabled} disabled={toggle.isPending} onCheckedChange={enabled => toggle.mutate({ id: plugin.id, enabled })} aria-label={t("plugins.enabled")} />
        ) : (
          <Button disabled={install.isPending} onClick={() => install.mutate(plugin.id)}>
            {install.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("install")}
          </Button>
        )}
      </div>

      {(data?.description ?? plugin.description) && <p className="text-sm text-muted-foreground">{data?.description ?? plugin.description}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
      {error && <p className="text-sm text-destructive">{message(error)}</p>}

      {data && (
        <>
          {servers.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-medium">{t("plugins.mcpServers")}</h3>
              <div className="divide-y rounded-xl border">
                {servers.map(([name, config]) => (
                  <div key={name} className="px-4 py-3">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {String(config.command ?? config.url ?? "")} {Array.isArray(config.args) ? config.args.join(" ") : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.skills.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-medium">{t("plugins.skills")}</h3>
              <div className="divide-y rounded-xl border">
                {data.skills.map(skill => (
                  <div key={skill.name} className="px-4 py-3">
                    <p className="text-sm font-medium">{skill.name}</p>
                    {skill.description && <p className="line-clamp-2 text-xs text-muted-foreground">{skill.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.other.length > 0 && <p className="text-sm text-muted-foreground">{t("plugins.alsoHas", { parts: data.other.join(", ") })}</p>}
          {path && <p className="break-all font-mono text-xs text-muted-foreground">{path}</p>}
        </>
      )}

      {plugin.installed && (
        <div className="flex gap-2">
          <Button variant="outline" disabled={copy.isPending} onClick={() => copy.run(plugin.id)}>
            {copy.isPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRightLeft className="size-4" />}
            {t("plugins.copyTo", { client: copy.targetLabel })}
          </Button>
          <Button variant="outline" className="text-destructive" onClick={onUninstall}>
            {t("plugins.uninstall")}
          </Button>
        </div>
      )}
    </div>
  );
}
