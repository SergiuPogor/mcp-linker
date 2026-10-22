import { CatalogCard } from "@/components/common/CatalogCard";
import { PluginIcon } from "@/components/plugins/PluginIcon";
import { ClientIcon } from "@/components/ClientIcon";
import { AddSkillDialog } from "@/components/skills/AddSkillDialog";
import { SkillDetail } from "@/components/skills/SkillDetail";
import { useSkillActions } from "@/components/skills/useSkillActions";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { SearchToggle } from "@/components/common/SearchToggle";
import { HomeNav } from "@/components/layout/HomeNav";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useViewStore } from "@/stores/viewStore";
import { PLUGIN_CLIENTS, type PluginClient } from "@/lib/plugins";
import { type CatalogSkill, type Skill, bundledSkills, checkSkillUpdates, fetchCatalog, hasSkill, listSkills } from "@/lib/skills";
import { useQuery } from "@tanstack/react-query";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Check, Download, Loader2, Plus, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const clientIconId = (client: PluginClient) => (client === "claude-code" ? "claude_code" : "codex");
const CONTRIBUTE_URL = "https://github.com/milisp/mcp-linker/blob/main/CONTRIBUTING.md#listing-a-skill";

type Tab = "installed" | "curated" | "community";

const matches = (needle: string, ...fields: (string | null | undefined)[]) => !needle || fields.some(f => f?.toLowerCase().includes(needle));

export default function SkillsPage() {
  const { t } = useTranslation();
  const discovering = useViewStore(state => state.search.scope === "discover");
  const [source, setSource] = useState<Exclude<Tab, "installed">>("curated");
  const tab: Tab = discovering ? source : "installed";
  const [query, setQuery] = useState("");
  const [clientId, setClientId] = useState<PluginClient>(PLUGIN_CLIENTS[0].id);
  const [selected, setSelected] = useState<string[]>([]);
  const [openName, setOpenName] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string[] | null>(null);
  const [adding, setAdding] = useState(false);
  const { setClient, installCatalog, uninstall, update, refresh } = useSkillActions();

  const skills = useQuery({ queryKey: ["skills"], queryFn: listSkills });
  const catalog = useQuery({ queryKey: ["skill-catalog"], queryFn: fetchCatalog, retry: false, staleTime: 3_600_000 });
  const updates = useQuery({ queryKey: ["skill-updates"], queryFn: checkSkillUpdates, enabled: false, retry: false });

  const installed = skills.data ?? [];
  const byName = useMemo(() => new Map(installed.map(s => [s.name, s])), [installed]);
  const outdated = useMemo(() => new Set(updates.data?.map(u => u.name) ?? []), [updates.data]);
  const entries: CatalogSkill[] = catalog.data ?? bundledSkills;
  const needle = query.trim().toLowerCase();

  const shownInstalled = installed.filter(s => matches(needle, s.name, s.description, s.source));
  const tabEntries = entries.filter(e => (tab === "curated" ? !!e.curated : !e.curated));
  const shownCatalog = tabEntries.filter(e => matches(needle, e.name, e.description, e.repo, e.category));
  // Grouped like Discover: one titled section per category.
  const catalogGroups = new Map<string, CatalogSkill[]>();
  for (const entry of shownCatalog) catalogGroups.set(entry.category ?? "other", [...(catalogGroups.get(entry.category ?? "other") ?? []), entry]);
  const counts = { installed: installed.length, curated: entries.filter(e => e.curated).length, community: entries.filter(e => !e.curated).length };

  const open = openName ? byName.get(openName) : undefined;
  const names = tab === "installed" ? shownInstalled.map(s => s.name) : [];
  const pickedNames = selected.filter(n => names.includes(n));
  const allPicked = names.length > 0 && pickedNames.length === names.length;
  const toggle = (name: string, on: boolean) => setSelected(on ? [...selected, name] : selected.filter(n => n !== name));
  const busy = setClient.isPending || installCatalog.isPending || uninstall.isPending || update.isPending;

  // A catalog entry is stale when its pinned commit moved past the installed one.
  const catalogStale = (entry: CatalogSkill) => {
    const have = byName.get(entry.name);
    return !!have && !!entry.sha && have.installedRef !== entry.sha;
  };

  const checkUpdates = async () => {
    const result = await updates.refetch();
    if (result.error) toast.error(result.error instanceof Error ? result.error.message : String(result.error), { duration: 15_000 });
    else toast.message(result.data?.length ? t("skills.updatesFound", { count: result.data.length }) : t("skills.upToDate"));
  };

  const client = PLUGIN_CLIENTS.find(c => c.id === clientId) ?? PLUGIN_CLIENTS[0];

  const header = (
    <HomeNav kind="skills" scope={discovering ? "discover" : "yours"}>
      <SearchToggle value={query} onChange={setQuery} placeholder={t("skills.search")} />
      {discovering && (
        <Tabs
          value={source}
          onValueChange={next => {
            setSource(next as typeof source);
            setSelected([]);
          }}
        >
          <TabsList>
            <TabsTrigger value="curated">
              {t("skills.tabCurated")} <span className="ml-1 text-muted-foreground">{counts.curated}</span>
            </TabsTrigger>
            <TabsTrigger value="community">
              {t("skills.tabCommunity")} <span className="ml-1 text-muted-foreground">{counts.community}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      <Tabs value={clientId} onValueChange={next => setClientId(next as PluginClient)}>
        <TabsList>
          {PLUGIN_CLIENTS.map(c => (
            <TabsTrigger key={c.id} value={c.id} aria-label={c.label} title={c.label}>
              <ClientIcon client={clientIconId(c.id)} className="size-4" />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Button variant="ghost" size="icon" aria-label={t("skills.refresh")} title={t("skills.refresh")} onClick={refresh}>
        <RefreshCcw className={`size-4 ${skills.isFetching ? "animate-spin" : ""}`} />
      </Button>
      {!discovering && (
        <Button variant="ghost" size="icon" aria-label={t("skills.checkUpdates")} title={t("skills.checkUpdates")} disabled={updates.isFetching} onClick={checkUpdates}>
          {updates.isFetching ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        </Button>
      )}
      <Button className="rounded-full" onClick={() => setAdding(true)}>
        <Plus className="size-4" />
        {t("skills.add")}
      </Button>
    </HomeNav>
  );

  /** What the picked rows can be given: link to a client, install, update, remove. */
  const batchBar = pickedNames.length > 0 && (
    <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-sm backdrop-blur">
      <span className="px-2 text-sm font-medium">{t("skills.selected", { count: pickedNames.length })}</span>
      {tab === "installed" ? (
        <>
          {pickedNames.some(n => outdated.has(n)) && (
            <Button variant="outline" size="sm" disabled={busy} onClick={() => update.mutate(pickedNames.filter(n => outdated.has(n)))}>
              {t("skills.update")}
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-destructive" disabled={busy} onClick={() => setRemoving(pickedNames)}>
            {t("skills.uninstall")}
          </Button>
        </>
      ) : null}
      <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected([])}>
        {t("skills.clear")}
      </Button>
    </div>
  );

  /** Select-all row; on the installed tab the client switches on its right flip every shown skill at once. */
  const selectAll = names.length > 0 && (
    <div className="flex items-center justify-between gap-3 px-2 pb-1">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox checked={allPicked} onCheckedChange={on => setSelected(on ? names : [])} />
        {t("skills.selectAll")}
      </label>
      {tab === "installed" && (
        <Switch
          checked={shownInstalled.every(s => hasSkill(s, client.id))}
          disabled={busy}
          onCheckedChange={enabled => setClient.mutate({ names, client: client.id, enabled })}
          aria-label={t("skills.enabledIn", { client: client.label })}
        />
      )}
    </div>
  );

  const installedRow = (skill: Skill) => (
    <CatalogCard
      key={skill.name}
      icon={<PluginIcon name={skill.name} icon={null} className="size-9" />}
      title={skill.name}
      description={skill.description}
      badge={outdated.has(skill.name) && <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-normal text-amber-600">{t("skills.updateAvailable")}</span>}
      onOpen={() => setOpenName(skill.name)}
      leading={<Checkbox checked={selected.includes(skill.name)} onCheckedChange={on => toggle(skill.name, !!on)} aria-label={skill.name} />}
      action={<Switch checked={hasSkill(skill, client.id)} disabled={busy} onCheckedChange={enabled => setClient.mutate({ names: [skill.name], client: client.id, enabled })} aria-label={t("skills.enabledIn", { client: client.label })} title={t("skills.enabledIn", { client: client.label })} />}
    />
  );

  const catalogRow = (entry: CatalogSkill) => {
    const have = byName.get(entry.name);
    const stale = catalogStale(entry);
    const installing = installCatalog.isPending && installCatalog.variables?.skills.includes(entry);
    const linked = !!have && hasSkill(have, client.id);
    const current = linked && !stale;
    const label = current ? t("skills.enabledIn", { client: client.label }) : stale && linked ? t("skills.update") : t("skills.installTo", { client: client.label });
    return (
      <CatalogCard
        key={entry.name}
        icon={<PluginIcon name={entry.name} icon={null} className="size-9" />}
        title={entry.name}
        description={entry.description}
        action={
          <Button size="icon" variant={current ? "ghost" : "outline"} className="size-8" disabled={busy || current} title={label} aria-label={`${label}: ${entry.name}`} onClick={() => installCatalog.mutate({ skills: [entry], clients: [client.id] })}>
            {installing ? <Loader2 className="size-4 animate-spin" /> : current ? <Check className="size-4 text-emerald-600" /> : stale && linked ? <RefreshCcw className="size-4" /> : <Plus className="size-4" />}
          </Button>
        }
      />
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen">
      <div className={`mx-auto space-y-6 ${tab === "installed" || open ? "max-w-4xl" : "max-w-6xl"}`}>
        {open ? (
          <SkillDetail skill={open} outdated={outdated.has(open.name)} onBack={() => setOpenName(null)} onUninstall={() => setRemoving([open.name])} />
        ) : (
          <>
            {header}
            {batchBar}
            {tab === "installed" ? (
              skills.isLoading ? (
                <p className="text-sm text-muted-foreground">{t("loading")}</p>
              ) : installed.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("skills.emptyInstalled")}</p>
              ) : shownInstalled.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("skills.noMatches")}</p>
              ) : (
                <div className="space-y-2">
                  {selectAll}
                  {shownInstalled.map(installedRow)}
                </div>
              )
            ) : (
              <div className="space-y-8">
                {catalog.error && <p className="text-sm text-muted-foreground">{t("skills.catalogOffline")}</p>}
                {shownCatalog.length === 0 && <p className="text-sm text-muted-foreground">{t("skills.noMatches")}</p>}
                {Array.from(catalogGroups, ([category, group]) => (
                  <section key={category} className="space-y-2" aria-label={category}>
                    <h2 className="text-lg font-semibold capitalize">{category}</h2>
                    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">{group.map(catalogRow)}</div>
                  </section>
                ))}
                {tab === "community" && (
                  <div className="mt-4 rounded-xl border p-4">
                    <p className="font-medium">{t("skills.submitTitle")}</p>
                    <p className="text-sm text-muted-foreground">{t("skills.submitBody")}</p>
                    <Button variant="link" className="h-auto p-0" onClick={() => openUrl(CONTRIBUTE_URL)}>
                      {t("skills.submitLink")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <AddSkillDialog open={adding} onOpenChange={setAdding} />

      <AlertDialog open={removing !== null} onOpenChange={next => !next && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("skills.uninstallTitle", { count: removing?.length ?? 0 })}</AlertDialogTitle>
            <AlertDialogDescription>
              {removing && removing.length <= 5 ? `${removing.join(", ")}. ` : ""}
              {t("skills.uninstallBody")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={uninstall.isPending}
              onClick={() =>
                removing &&
                uninstall.mutate(removing, {
                  onSuccess: () => {
                    setOpenName(null);
                    setSelected([]);
                  },
                  onSettled: () => setRemoving(null),
                })
              }
            >
              {t("skills.uninstall")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
