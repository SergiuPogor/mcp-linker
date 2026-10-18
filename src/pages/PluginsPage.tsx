import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PACKS_MARKETPLACE,
  PLUGIN_CLIENTS,
  type Plugin,
  type PluginClient,
  addMarketplace,
  copyPlugin,
  installPlugin,
  listMarketplaces,
  listPlugins,
  otherClient,
  pluginDetails,
  setPluginEnabled,
  uninstallPlugin,
} from "@/lib/plugins";
import { requirePro } from "@/stores/license";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, ChevronDown, ChevronRight, Package, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));
const labelOf = (client: PluginClient) => PLUGIN_CLIENTS.find(c => c.id === client)?.label ?? client;

function PluginDetailsPanel({ client, id }: { client: PluginClient; id: string }) {
  const { t } = useTranslation();
  const { data, error, isLoading } = useQuery({ queryKey: ["plugin", client, id], queryFn: () => pluginDetails(client, id) });
  if (isLoading) return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  if (error || !data) return <p className="text-sm text-destructive">{message(error)}</p>;
  const servers = Object.entries(data.mcpServers);
  return (
    <div className="space-y-3 text-sm">
      {data.description && <p className="text-muted-foreground">{data.description}</p>}
      <div>
        <h4 className="font-medium">{t("plugins.mcpServers")}</h4>
        {servers.length === 0 && <p className="text-muted-foreground">{t("plugins.none")}</p>}
        {servers.map(([name, config]) => (
          <p key={name} className="font-mono text-xs">
            {name} <span className="text-muted-foreground">{String(config.command ?? config.url ?? "")} {Array.isArray(config.args) ? config.args.join(" ") : ""}</span>
          </p>
        ))}
      </div>
      <div>
        <h4 className="font-medium">{t("plugins.skills")}</h4>
        {data.skills.length === 0 && <p className="text-muted-foreground">{t("plugins.none")}</p>}
        {data.skills.map(skill => (
          <p key={skill.name}>
            <span className="font-mono text-xs">{skill.name}</span>
            {skill.description && <span className="text-muted-foreground"> — {skill.description}</span>}
          </p>
        ))}
      </div>
      {data.other.length > 0 && <p className="text-muted-foreground">{t("plugins.alsoHas", { parts: data.other.join(", ") })}</p>}
      {data.path && <p className="font-mono text-xs text-muted-foreground break-all">{data.path}</p>}
    </div>
  );
}

function PluginRow({ client, plugin, onUninstall }: { client: PluginClient; plugin: Plugin; onUninstall: (plugin: Plugin) => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const target = otherClient(client);

  const toggle = useMutation({
    mutationFn: (enabled: boolean) => setPluginEnabled(client, plugin.id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plugins", client] }),
    onError: error => toast.error(message(error)),
  });
  const copy = useMutation({
    mutationFn: () => copyPlugin(client, target, plugin.id),
    onSuccess: report => {
      queryClient.invalidateQueries({ queryKey: ["plugins", target] });
      toast.success(t("plugins.copied", { id: report.id, client: labelOf(target) }), {
        description: report.skipped.length ? t("plugins.leftOut", { parts: report.skipped.join(", ") }) : undefined,
      });
    },
    onError: error => toast.error(message(error)),
  });

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
          <span className="truncate font-medium">{plugin.name}</span>
          <Badge variant="secondary">{plugin.marketplace}</Badge>
          {plugin.version && <span className="text-xs text-muted-foreground">{plugin.version}</span>}
          {plugin.scope && plugin.scope !== "user" && <Badge variant="outline">{plugin.scope}</Badge>}
        </button>
        <Button
          variant="outline"
          size="sm"
          disabled={copy.isPending}
          onClick={() => requirePro("pluginSync") && copy.mutate()}
          title={t("plugins.copyTo", { client: labelOf(target) })}
        >
          <ArrowRightLeft className={`size-4 ${copy.isPending ? "animate-pulse" : ""}`} />
          <span className="hidden sm:inline">{t("plugins.copyTo", { client: labelOf(target) })}</span>
        </Button>
        <Switch checked={plugin.enabled} disabled={toggle.isPending} onCheckedChange={checked => toggle.mutate(checked)} aria-label={t("plugins.enabled")} />
        <Button variant="ghost" size="icon" aria-label={t("plugins.uninstall")} title={t("plugins.uninstall")} onClick={() => onUninstall(plugin)}>
          <Trash2 className="size-4" />
        </Button>
      </div>
      {open && (
        <div className="mt-3 border-t pt-3">
          <PluginDetailsPanel client={client} id={plugin.id} />
        </div>
      )}
    </div>
  );
}

export default function PluginsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [client, setClient] = useState<PluginClient>("claude-code");
  const [source, setSource] = useState("");
  const [installId, setInstallId] = useState("");
  const [removing, setRemoving] = useState<Plugin | null>(null);

  const plugins = useQuery({ queryKey: ["plugins", client], queryFn: () => listPlugins(client), retry: false });
  const marketplaces = useQuery({ queryKey: ["plugin-marketplaces", client], queryFn: () => listMarketplaces(client), retry: false });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["plugins", client] });
    queryClient.invalidateQueries({ queryKey: ["plugin-marketplaces", client] });
  };

  const addSource = useMutation({
    mutationFn: (value: string) => addMarketplace(client, value),
    onSuccess: (_, value) => {
      setSource("");
      refresh();
      toast.success(t("plugins.marketplaceAdded", { source: value, client: labelOf(client) }));
    },
    onError: error => toast.error(message(error)),
  });
  const install = useMutation({
    mutationFn: (id: string) => installPlugin(client, id),
    onSuccess: (_, id) => {
      setInstallId("");
      refresh();
      toast.success(t("plugins.installed", { id, client: labelOf(client) }));
    },
    onError: error => toast.error(message(error)),
  });
  const uninstall = useMutation({
    mutationFn: (plugin: Plugin) => uninstallPlugin(client, plugin.id),
    onSuccess: refresh,
    onError: error => toast.error(message(error)),
    onSettled: () => setRemoving(null),
  });

  const hasPacks = marketplaces.data?.some(m => m.source?.includes(PACKS_MARKETPLACE) || m.name === "mcp-linker");

  return (
    <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("plugins.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("plugins.subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={client} onValueChange={value => setClient(value as PluginClient)}>
            <TabsList>
              {PLUGIN_CLIENTS.map(c => <TabsTrigger key={c.id} value={c.id}>{c.label}</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={refresh} disabled={plugins.isFetching}>
            <RefreshCcw className={`size-4 ${plugins.isFetching ? "animate-spin" : ""}`} />
            {t("plugins.refresh")}
          </Button>
        </div>

        {plugins.error ? (
          <div className="rounded-lg border border-destructive/50 p-4 text-sm">
            <p className="font-medium">{t("plugins.unavailable", { client: labelOf(client) })}</p>
            <p className="mt-1 text-muted-foreground">{message(plugins.error)}</p>
          </div>
        ) : (
          <>
            {marketplaces.data && !hasPacks && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 p-4">
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 size-5 shrink-0" />
                  <div>
                    <p className="font-medium">{t("plugins.packsTitle")}</p>
                    <p className="text-sm text-muted-foreground">{t("plugins.packsBody")}</p>
                  </div>
                </div>
                <Button size="sm" disabled={addSource.isPending} onClick={() => addSource.mutate(PACKS_MARKETPLACE)}>
                  <Plus className="size-4" />
                  {t("plugins.addPacks")}
                </Button>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <form
                className="flex gap-2"
                onSubmit={event => {
                  event.preventDefault();
                  if (installId.trim()) install.mutate(installId.trim());
                }}
              >
                <Input value={installId} onChange={event => setInstallId(event.target.value)} placeholder={t("plugins.installPlaceholder")} />
                <Button type="submit" variant="outline" disabled={!installId.trim() || install.isPending}>{t("install")}</Button>
              </form>
              <form
                className="flex gap-2"
                onSubmit={event => {
                  event.preventDefault();
                  if (source.trim()) addSource.mutate(source.trim());
                }}
              >
                <Input value={source} onChange={event => setSource(event.target.value)} placeholder={t("plugins.marketplacePlaceholder")} />
                <Button type="submit" variant="outline" disabled={!source.trim() || addSource.isPending}>{t("plugins.addMarketplace")}</Button>
              </form>
            </div>

            <div className="space-y-2">
              {plugins.isLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
              {plugins.data?.length === 0 && <p className="text-sm text-muted-foreground">{t("plugins.empty", { client: labelOf(client) })}</p>}
              {plugins.data?.map(plugin => <PluginRow key={plugin.id} client={client} plugin={plugin} onUninstall={setRemoving} />)}
            </div>

            {marketplaces.data && marketplaces.data.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {t("plugins.marketplaces")}: {marketplaces.data.map(m => m.name).join(", ")}
              </p>
            )}
          </>
        )}
      </div>

      <AlertDialog open={removing !== null} onOpenChange={open => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("plugins.uninstallTitle", { id: removing?.id })}</AlertDialogTitle>
            <AlertDialogDescription>{t("plugins.uninstallBody", { client: labelOf(client) })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={uninstall.isPending} onClick={() => removing && uninstall.mutate(removing)}>{t("plugins.uninstall")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
