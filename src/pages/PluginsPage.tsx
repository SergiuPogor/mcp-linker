import { ClientIcon } from "@/components/ClientIcon";
import { ActivityDialog } from "@/components/plugins/ActivityLog";
import { PluginItem } from "@/components/plugins/PluginCard";
import { PluginDetailView } from "@/components/plugins/PluginDetailView";
import { PluginSyncPanel } from "@/components/plugins/PluginSyncPanel";
import { usePluginActions } from "@/components/plugins/usePluginActions";
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SearchToggle } from "@/components/common/SearchToggle";
import { UpdateCard } from "@/components/common/UpdateCard";
import { UpdateSection } from "@/components/common/UpdateSection";
import { HomeNav } from "@/components/layout/HomeNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PACKS_MARKETPLACE, PLUGIN_CLIENTS, bundledPacks, fetchPacks, type CatalogEntry, type PluginClient, addMarketplace, checkPluginUpdates, pluginCatalog, uninstallPlugin } from "@/lib/plugins";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, ChevronRight, Download, History, Loader2, Plus, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useViewStore } from "@/stores/viewStore";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));
const labelOf = (client: PluginClient) => PLUGIN_CLIENTS.find(c => c.id === client)?.label ?? client;
const clientIconId = (client: PluginClient) => (client === "claude-code" ? "claude_code" : "codex");
const titleCase = (text: string) => text.replace(/[-_]/g, " ").replace(/^\w/, c => c.toUpperCase());
/** Rows shown per section until it is expanded. */
const PREVIEW = 8;
/** Rows shown in an expanded section; Codex's public catalog has thousands. */
const MAX_ROWS = 100;

type Tab = "public" | "curated" | "personal" | "community";

const tabOf = (entry: CatalogEntry): Tab => (entry.official ? "public" : entry.curated ? "curated" : entry.community ? "community" : "personal");

interface Section {
  key: string;
  title: string;
  entries: CatalogEntry[];
}

/** Installed plugins first, then the rest grouped: Public and Community by category, Personal by marketplace. */
function sectionsOf(entries: CatalogEntry[], tab: Tab, installedTitle: string): Section[] {
  const installed = entries.filter(e => e.installed);
  const groups = new Map<string, CatalogEntry[]>();
  for (const entry of entries.filter(e => !e.installed)) {
    const key = tab !== "personal" ? titleCase(entry.category ?? "Other") : entry.marketplace;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return [
    ...(installed.length ? [{ key: "installed", title: installedTitle, entries: installed }] : []),
    ...[...groups].map(([title, list]) => ({ key: title, title, entries: list })),
  ];
}

export default function PluginsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { search, navigate } = useViewStore();
  const discovering = search.scope === "discover";
  const [client, setClient] = useState<PluginClient>("claude-code");
  const [tab, setTab] = useState<Tab>("public");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<CatalogEntry | null>(null);
  const [adding, setAdding] = useState(false);
  const [linkerOpen, setLinkerOpen] = useState(false);
  const [source, setSource] = useState("");
  const [gitRef, setGitRef] = useState("");
  const [sparse, setSparse] = useState("");
  const [showActivity, setShowActivity] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const catalog = useQuery({ queryKey: ["plugin-catalog", client], queryFn: () => pluginCatalog(client), retry: false });
  const { toggle, install, update, updateProgress, refresh } = usePluginActions(client, labelOf(client));
  const updates = useQuery({ queryKey: ["plugin-updates", client], queryFn: () => checkPluginUpdates(client, true), enabled: false, retry: false });
  const all = catalog.data?.plugins ?? [];
  const selected = all.find(p => p.id === selectedId) ?? null;
  const packsPreview = useQuery({ queryKey: ["packs-preview"], queryFn: fetchPacks, retry: false, staleTime: 3_600_000 });
  const packs = catalog.data?.marketplaces.find(m => m.source?.includes(PACKS_MARKETPLACE) || m.name === "mcp-linker");

  const sections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = all.filter(
      e => (discovering ? tabOf(e) === tab : e.installed) && (!needle || [e.name, e.displayName, e.description, e.marketplace].some(f => f?.toLowerCase().includes(needle))),
    );
    return sectionsOf(matches, tab, t("plugins.installedSection"));
  }, [all, tab, query, discovering, t]);
  const counts = { public: 0, curated: 0, personal: 0, community: 0 };
  for (const entry of all) counts[tabOf(entry)]++;

  const addSource = useMutation({
    mutationFn: ({ source, gitRef, sparse }: { source: string; gitRef: string; sparse: string[] }) => addMarketplace(client, source, gitRef.trim(), sparse),
    onSuccess: async (output, { source }) => {
      setAdding(false);
      setSource("");
      setGitRef("");
      setSparse("");
      queryClient.invalidateQueries({ queryKey: ["plugin-activity"] });
      // Say where the client put it, and show what it brought.
      const fresh = await queryClient.fetchQuery({ queryKey: ["plugin-catalog", client], queryFn: () => pluginCatalog(client), staleTime: 0 });
      const added = fresh.marketplaces.find(m => m.source === source || m.name === source.split("/").pop());
      setTab("personal");
      navigate("/plugins?scope=discover");
      toast.success(t("plugins.marketplaceAdded", { source, client: labelOf(client) }), {
        description: added?.location ? t("plugins.addedAt", { path: added.location }) : output.trim() || undefined,
      });
    },
    onError: error => {
      refresh();
      toast.error(message(error), { duration: 15_000 });
    },
  });
  const uninstall = useMutation({
    mutationFn: (plugin: CatalogEntry) => uninstallPlugin(client, plugin.id),
    onSuccess: () => {
      setSelectedId(null);
      refresh();
    },
    onError: error => toast.error(message(error), { duration: 15_000 }),
    onSettled: () => setRemoving(null),
  });

  const checkUpdates = async () => {
    const result = await updates.refetch();
    queryClient.invalidateQueries({ queryKey: ["plugin-activity"] });
    if (result.error) return void toast.error(message(result.error), { duration: 15_000 });
    const found = result.data?.updates.length ?? 0;
    toast.message(found ? t("plugins.updatesFound", { count: found }) : t("plugins.upToDate"));
  };

  const submit = () => {
    const text = source.trim();
    if (!text) return;
    addSource.mutate({ source: text, gitRef, sparse: sparse.split("\n").map(p => p.trim()).filter(Boolean) });
  };
  const busyId = install.isPending ? install.variables : toggle.isPending ? toggle.variables.id : null;

  return (
    <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {syncing ? (
          <PluginSyncPanel onClose={() => setSyncing(false)} />
        ) : selected ? (
          <PluginDetailView client={client} plugin={selected} onBack={() => setSelectedId(null)} onUninstall={() => setRemoving(selected)} />
        ) : (
          <>
            <HomeNav kind="plugins" scope={discovering ? "discover" : "yours"}>
              <SearchToggle value={query} onChange={setQuery} placeholder={t("plugins.search")} />
              <Tabs
                value={client}
                onValueChange={next => {
                  setClient(next as PluginClient);
                  setSelectedId(null);
                  setExpanded([]);
                }}
              >
                <TabsList>
                  {PLUGIN_CLIENTS.map(c => (
                    <TabsTrigger key={c.id} value={c.id} aria-label={c.label} title={c.label}>
                      <ClientIcon client={clientIconId(c.id)} className="size-4" />
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Button variant="ghost" size="icon" aria-label={t("plugins.refresh")} title={t("plugins.refresh")} onClick={refresh}>
                <RefreshCcw className={`size-4 ${catalog.isFetching ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" aria-label={t("plugins.checkUpdates")} title={t("plugins.checkUpdates")} disabled={updates.isFetching} onClick={checkUpdates}>
                {updates.isFetching ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              </Button>
              <Button variant="ghost" size="icon" aria-label={t("plugins.activity")} title={t("plugins.activity")} onClick={() => setShowActivity(true)}>
                <History className="size-4" />
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setSyncing(true)}>
                <ArrowLeftRight className="size-4" />
                {t("plugins.sync")}
              </Button>
              <Button className="rounded-full" onClick={() => setAdding(true)}>
                <Plus className="size-4" />
                {t("plugins.add")}
              </Button>
            </HomeNav>

            {!discovering && updates.data && (
              <UpdateSection
                title={t("plugins.updatesFound", { count: updates.data.updates.length })}
                upToDate={t("plugins.upToDate")}
                count={updates.data.updates.length}
                checkedAt={updates.dataUpdatedAt}
                failures={updates.data.refreshError ? [{ name: t("plugins.marketplacesRefresh"), error: updates.data.refreshError }] : []}
                progress={updateProgress}
                disabled={update.isPending}
                onUpdateAll={() => update.mutate(updates.data.updates.map(u => u.id))}
              >
                {updates.data.updates.map(info => (
                  <UpdateCard key={info.id} name={info.id} from={info.installed} to={info.latest} date={info.latestDate} disabled={update.isPending} pending={updateProgress?.current === info.id} onUpdate={() => update.mutate([info.id])} />
                ))}
              </UpdateSection>
            )}

            {discovering && catalog.data && !packs && (
              <div className="rounded-xl border p-4">
                <div className="flex items-center gap-4">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setLinkerOpen(open => !open)}>
                    <span className="block font-medium">{t("plugins.linkerTitle")}</span>
                    <span className="block text-sm text-muted-foreground">{t("plugins.linkerBody")}</span>
                  </button>
                  <Button variant="outline" className="shrink-0 rounded-full" disabled={addSource.isPending} onClick={() => addSource.mutate({ source: PACKS_MARKETPLACE, gitRef: "", sparse: [] })}>
                    {t("plugins.add")}
                  </Button>
                  <button type="button" aria-expanded={linkerOpen} className="shrink-0 text-muted-foreground" onClick={() => setLinkerOpen(open => !open)}>
                    <ChevronRight className={`size-4 transition-transform ${linkerOpen ? "rotate-90" : ""}`} />
                  </button>
                </div>
                {linkerOpen && (
                  <ul className="mt-3 space-y-3 border-t pt-3">
                    {(packsPreview.data ?? bundledPacks).map(plugin => (
                      <li key={plugin.name} className="text-sm">
                        <p className="font-medium">{plugin.name}</p>
                        <p className="text-muted-foreground">{plugin.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {discovering && <Tabs value={tab} onValueChange={next => setTab(next as Tab)}>
              <TabsList>
                <TabsTrigger value="public">
                  {t("plugins.tabPublic")} <span className="ml-1 text-muted-foreground">{counts.public}</span>
                </TabsTrigger>
                <TabsTrigger value="curated">
                  {t("plugins.tabCurated")} <span className="ml-1 text-muted-foreground">{counts.curated}</span>
                </TabsTrigger>
                <TabsTrigger value="personal">
                  {t("plugins.tabPersonal")} <span className="ml-1 text-muted-foreground">{counts.personal}</span>
                </TabsTrigger>
                <TabsTrigger value="community">
                  {t("plugins.tabCommunity")} <span className="ml-1 text-muted-foreground">{counts.community}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>}

            {catalog.error ? (
              <div className="rounded-xl border border-destructive/50 p-4 text-sm">
                <p className="font-medium">{t("plugins.unavailable", { client: labelOf(client) })}</p>
                <p className="mt-1 text-muted-foreground">{message(catalog.error)}</p>
              </div>
            ) : catalog.isLoading ? (
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            ) : sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("plugins.noMatches")}</p>
            ) : (
              sections.map(section => {
                const open = !!query.trim() || section.key === "installed" || expanded.includes(section.key);
                const shown = section.entries.slice(0, open ? MAX_ROWS : PREVIEW);
                return (
                  <section key={section.key}>
                    <button
                      type="button"
                      className="mb-2 flex items-center gap-1 text-lg font-medium"
                      onClick={() => setExpanded(open ? expanded.filter(k => k !== section.key) : [...expanded, section.key])}
                    >
                      {section.title}
                      <span className="text-sm font-normal text-muted-foreground">{section.entries.length}</span>
                      {section.entries.length > PREVIEW && <ChevronRight className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />}
                    </button>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {shown.map(entry => (
                        <PluginItem
                          key={entry.id}
                          entry={entry}
                          busy={busyId === entry.id}
                          onOpen={() => setSelectedId(entry.id)}
                          onToggle={enabled => toggle.mutate({ id: entry.id, enabled })}
                          onInstall={() => install.mutate(entry.id)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </>
        )}
      </div>

      <Dialog open={adding} onOpenChange={open => !open && setAdding(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("plugins.addMarketplace")}</DialogTitle>
            <DialogDescription>{t("plugins.marketplaceHint")}</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={event => {
              event.preventDefault();
              submit();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="marketplace-source">{t("plugins.marketplaceSource")}</Label>
              <Input id="marketplace-source" autoFocus value={source} onChange={event => setSource(event.target.value)} placeholder="openai/plugins or git@github.com:org/repo.git" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketplace-ref">{t("plugins.marketplaceRef")}</Label>
              <Input id="marketplace-ref" value={gitRef} onChange={event => setGitRef(event.target.value)} placeholder="main" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marketplace-sparse">{t("plugins.marketplaceSparse")}</Label>
              <Textarea id="marketplace-sparse" rows={4} value={sparse} onChange={event => setSparse(event.target.value)} placeholder="plugins/codex" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={!source.trim() || addSource.isPending}>
                {t("plugins.addMarketplace")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ActivityDialog open={showActivity} onOpenChange={setShowActivity} />

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
