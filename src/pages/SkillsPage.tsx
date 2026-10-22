import { ClientIcon } from "@/components/ClientIcon";
import { AddSkillDialog } from "@/components/skills/AddSkillDialog";
import { SkillDetail } from "@/components/skills/SkillDetail";
import { clientLabel, useSkillActions } from "@/components/skills/useSkillActions";
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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PLUGIN_CLIENTS, type PluginClient } from "@/lib/plugins";
import { type CatalogSkill, type Skill, bundledSkills, checkSkillUpdates, fetchCatalog, hasSkill, listSkills } from "@/lib/skills";
import { useQuery } from "@tanstack/react-query";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Download, Loader2, Plus, RefreshCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const clientIconId = (client: PluginClient) => (client === "claude-code" ? "claude_code" : "codex");
const CONTRIBUTE_URL = "https://github.com/milisp/mcp-linker/blob/main/CONTRIBUTING.md#listing-a-skill";

type Tab = "installed" | "curated" | "community";

const matches = (needle: string, ...fields: (string | null | undefined)[]) => !needle || fields.some(f => f?.toLowerCase().includes(needle));

export default function SkillsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("installed");
  const [query, setQuery] = useState("");
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
  const shownCatalog = entries.filter(e => (tab === "curated" ? !!e.curated : !e.curated) && matches(needle, e.name, e.description, e.repo, e.category));
  const counts = { installed: installed.length, curated: entries.filter(e => e.curated).length, community: entries.filter(e => !e.curated).length };

  const open = openName ? byName.get(openName) : undefined;
  const names = tab === "installed" ? shownInstalled.map(s => s.name) : shownCatalog.map(e => e.name);
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

  const header = (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("skills.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("skills.subtitle")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="rounded-full pl-9" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("skills.search")} />
        </div>
        <Button variant="ghost" size="icon" aria-label={t("skills.refresh")} title={t("skills.refresh")} onClick={refresh}>
          <RefreshCcw className={`size-4 ${skills.isFetching ? "animate-spin" : ""}`} />
        </Button>
        <Button variant="ghost" size="icon" aria-label={t("skills.checkUpdates")} title={t("skills.checkUpdates")} disabled={updates.isFetching} onClick={checkUpdates}>
          {updates.isFetching ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        </Button>
        <Button className="rounded-full" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          {t("skills.add")}
        </Button>
      </div>
      <Tabs
        value={tab}
        onValueChange={next => {
          setTab(next as Tab);
          setSelected([]);
        }}
      >
        <TabsList>
          <TabsTrigger value="installed">
            {t("skills.tabInstalled")} <span className="ml-1 text-muted-foreground">{counts.installed}</span>
          </TabsTrigger>
          <TabsTrigger value="curated">
            {t("skills.tabCurated")} <span className="ml-1 text-muted-foreground">{counts.curated}</span>
          </TabsTrigger>
          <TabsTrigger value="community">
            {t("skills.tabCommunity")} <span className="ml-1 text-muted-foreground">{counts.community}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  /** What the picked rows can be given: link to a client, install, update, remove. */
  const batchBar = pickedNames.length > 0 && (
    <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 rounded-xl border bg-background/95 p-2 shadow-sm backdrop-blur">
      <span className="px-2 text-sm font-medium">{t("skills.selected", { count: pickedNames.length })}</span>
      {tab === "installed" ? (
        <>
          {PLUGIN_CLIENTS.map(client => (
            <Button key={client.id} variant="outline" size="sm" disabled={busy} onClick={() => setClient.mutate({ names: pickedNames, client: client.id, enabled: true })}>
              <ClientIcon client={clientIconId(client.id)} className="size-4" />
              {t("skills.addTo", { client: client.label })}
            </Button>
          ))}
          {pickedNames.some(n => outdated.has(n)) && (
            <Button variant="outline" size="sm" disabled={busy} onClick={() => update.mutate(pickedNames.filter(n => outdated.has(n)))}>
              {t("skills.update")}
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-destructive" disabled={busy} onClick={() => setRemoving(pickedNames)}>
            {t("skills.uninstall")}
          </Button>
        </>
      ) : (
        <>
          {PLUGIN_CLIENTS.map(client => (
            <Button key={client.id} variant="outline" size="sm" disabled={busy} onClick={() => installCatalog.mutate({ skills: shownCatalog.filter(e => pickedNames.includes(e.name)), clients: [client.id] })}>
              <ClientIcon client={clientIconId(client.id)} className="size-4" />
              {t("skills.installTo", { client: client.label })}
            </Button>
          ))}
          <Button size="sm" disabled={busy} onClick={() => installCatalog.mutate({ skills: shownCatalog.filter(e => pickedNames.includes(e.name)) })}>
            {installCatalog.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("skills.install")}
          </Button>
        </>
      )}
      <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected([])}>
        {t("skills.clear")}
      </Button>
    </div>
  );

  const selectAll = names.length > 0 && (
    <label className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
      <Checkbox checked={allPicked} onCheckedChange={on => setSelected(on ? names : [])} />
      {t("skills.selectAll")}
    </label>
  );

  const installedRow = (skill: Skill) => (
    <div key={skill.name} role="button" tabIndex={0} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted/60" onClick={() => setOpenName(skill.name)} onKeyDown={event => event.key === "Enter" && setOpenName(skill.name)}>
      <div onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        <Checkbox checked={selected.includes(skill.name)} onCheckedChange={on => toggle(skill.name, !!on)} aria-label={skill.name} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate font-medium">
          {skill.name}
          {outdated.has(skill.name) && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-normal text-amber-600">{t("skills.updateAvailable")}</span>}
        </p>
        <p className="truncate text-sm text-muted-foreground">{skill.description}</p>
      </div>
      <div className="flex items-center gap-3" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
        {PLUGIN_CLIENTS.map(client => (
          <span key={client.id} className="flex items-center gap-1.5" title={t("skills.enabledIn", { client: clientLabel(client.id) })}>
            <ClientIcon client={clientIconId(client.id)} className="size-4" />
            <Switch checked={hasSkill(skill, client.id)} disabled={busy} onCheckedChange={enabled => setClient.mutate({ names: [skill.name], client: client.id, enabled })} aria-label={t("skills.enabledIn", { client: clientLabel(client.id) })} />
          </span>
        ))}
      </div>
    </div>
  );

  const catalogRow = (entry: CatalogSkill) => {
    const have = byName.get(entry.name);
    const stale = catalogStale(entry);
    return (
      <div key={entry.name} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/60">
        <Checkbox checked={selected.includes(entry.name)} onCheckedChange={on => toggle(entry.name, !!on)} aria-label={entry.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{entry.name}</p>
          <p className="line-clamp-2 text-sm text-muted-foreground">{entry.description}</p>
          <p className="truncate text-xs text-muted-foreground">{entry.repo}</p>
        </div>
        {have && !stale ? (
          <span className="text-sm text-muted-foreground">{t("skills.installedBadge")}</span>
        ) : (
          <Button variant="outline" size="sm" disabled={busy} onClick={() => installCatalog.mutate({ skills: [entry] })}>
            {installCatalog.isPending && installCatalog.variables?.skills.includes(entry) ? <Loader2 className="size-4 animate-spin" /> : null}
            {stale ? t("skills.update") : t("skills.install")}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
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
                <div className="space-y-1">
                  {selectAll}
                  {shownInstalled.map(installedRow)}
                </div>
              )
            ) : (
              <div className="space-y-1">
                {catalog.error && <p className="px-2 pb-2 text-sm text-muted-foreground">{t("skills.catalogOffline")}</p>}
                {shownCatalog.length === 0 ? <p className="text-sm text-muted-foreground">{t("skills.noMatches")}</p> : selectAll}
                {shownCatalog.map(catalogRow)}
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
