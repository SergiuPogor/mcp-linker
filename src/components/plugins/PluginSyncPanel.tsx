import { ClientIcon } from "@/components/ClientIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLUGIN_CLIENTS, pluginCatalog, type CatalogEntry, type PluginClient } from "@/lib/plugins";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PluginIcon } from "./PluginIcon";
import { usePluginActions } from "./usePluginActions";

const [LEFT, RIGHT] = PLUGIN_CLIENTS;
const clientIconId = (client: PluginClient) => (client === "claude-code" ? "claude_code" : "codex");

/** Installed plugins of one client by name; a copy lands in the other client under the bridge marketplace's id, so names are what match. */
function useInstalled(client: PluginClient) {
  const catalog = useQuery({ queryKey: ["plugin-catalog", client], queryFn: () => pluginCatalog(client), retry: false });
  const installed = new Map((catalog.data?.plugins ?? []).filter(p => p.installed).map(p => [p.name, p]));
  return { installed, loading: catalog.isLoading, error: catalog.error };
}

/** Two-pane copy of installed plugins between Claude Code and Codex; copies are staged on both sides until saved. */
export function PluginSyncPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const left = useInstalled(LEFT.id);
  const right = useInstalled(RIGHT.id);
  const fromLeft = usePluginActions(LEFT.id, LEFT.label);
  const fromRight = usePluginActions(RIGHT.id, RIGHT.label);

  // Names staged to land on each side, and the names ticked in each list.
  const [toRight, setToRight] = useState<Set<string>>(new Set());
  const [toLeft, setToLeft] = useState<Set<string>>(new Set());
  const [leftSel, setLeftSel] = useState<Set<string>>(new Set());
  const [rightSel, setRightSel] = useState<Set<string>>(new Set());
  const [leftFilter, setLeftFilter] = useState("");
  const [rightFilter, setRightFilter] = useState("");

  const saving = fromLeft.copy.manyPending || fromRight.copy.manyPending;
  const pending = toRight.size + toLeft.size;
  const missingRight = [...left.installed.keys()].filter(name => !right.installed.has(name) && !toRight.has(name));
  const missingLeft = [...right.installed.keys()].filter(name => !left.installed.has(name) && !toLeft.has(name));

  const reset = () => {
    setToRight(new Set());
    setToLeft(new Set());
    setLeftSel(new Set());
    setRightSel(new Set());
  };
  // A plugin is staged in one direction at a time.
  const stageRight = (names: string[]) => {
    const movable = names.filter(name => left.installed.has(name));
    setToRight(new Set([...toRight, ...movable]));
    setToLeft(new Set([...toLeft].filter(name => !movable.includes(name))));
    setLeftSel(new Set());
  };
  const stageLeft = (names: string[]) => {
    const movable = names.filter(name => right.installed.has(name));
    setToLeft(new Set([...toLeft, ...movable]));
    setToRight(new Set([...toRight].filter(name => !movable.includes(name))));
    setRightSel(new Set());
  };
  const unstage = (side: "left" | "right", name: string) =>
    side === "left" ? setToLeft(new Set([...toLeft].filter(n => n !== name))) : setToRight(new Set([...toRight].filter(n => n !== name)));

  const save = () => {
    const ids = (names: Set<string>, from: Map<string, CatalogEntry>) => [...names].flatMap(name => from.get(name)?.id ?? []);
    const rightIds = ids(toRight, left.installed);
    const leftIds = ids(toLeft, right.installed);
    const done = () => reset();
    const copyBack = () => (leftIds.length ? fromRight.copy.runMany(leftIds, done) : done());
    if (rightIds.length) fromLeft.copy.runMany(rightIds, copyBack);
    else copyBack();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={onClose} disabled={saving}>
          <ArrowLeft className="size-4" />
          {t("plugins.syncBack")}
        </Button>
        <div className="flex items-center gap-2">
          {pending > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{t("manage.sync.pending", { count: pending })}</span>
              <Button variant="outline" size="sm" onClick={reset} disabled={saving}>
                {t("manage.sync.reset")}
              </Button>
            </>
          )}
          <Button size="sm" onClick={save} disabled={!pending || saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </div>
      </div>

      <div className="grid h-[calc(100vh-10rem)] min-h-80 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-3">
        <PluginBox
          client={LEFT}
          own={left.installed}
          incoming={toLeft}
          incomingFrom={right.installed}
          queued={toRight}
          filter={leftFilter}
          onFilter={setLeftFilter}
          selected={leftSel}
          onSelect={setLeftSel}
          onActivate={name => (toLeft.has(name) ? unstage("left", name) : stageRight([name]))}
          empty={left.loading ? t("loading") : left.error ? String(left.error) : t("manage.sync.empty")}
          footer={
            <>
              <span />
              <Button variant="ghost" size="sm" onClick={() => stageRight(missingRight)} disabled={!missingRight.length || saving}>
                {t("manage.sync.copyMissing")}
                <ChevronsRight className="size-4" />
              </Button>
            </>
          }
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <Button variant="outline" size="icon" aria-label={t("manage.sync.copy")} title={t("manage.sync.copy")} onClick={() => stageRight([...leftSel])} disabled={!leftSel.size || saving}>
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon" aria-label={t("manage.sync.copy")} title={t("manage.sync.copy")} onClick={() => stageLeft([...rightSel])} disabled={!rightSel.size || saving}>
            <ChevronLeft />
          </Button>
        </div>
        <PluginBox
          client={RIGHT}
          own={right.installed}
          incoming={toRight}
          incomingFrom={left.installed}
          queued={toLeft}
          filter={rightFilter}
          onFilter={setRightFilter}
          selected={rightSel}
          onSelect={setRightSel}
          onActivate={name => (toRight.has(name) ? unstage("right", name) : stageLeft([name]))}
          empty={right.loading ? t("loading") : right.error ? String(right.error) : t("manage.sync.empty")}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => stageLeft(missingLeft)} disabled={!missingLeft.length || saving}>
                <ChevronsLeft className="size-4" />
                {t("manage.sync.copyMissing")}
              </Button>
              <span />
            </>
          }
        />
      </div>
    </div>
  );
}

/** One client's installed plugins, plus the ones staged to arrive from the other side. */
function PluginBox({ client, own, incoming, incomingFrom, queued, filter, onFilter, selected, onSelect, onActivate, empty, footer }: {
  client: { id: PluginClient; label: string };
  own: Map<string, CatalogEntry>;
  /** Names staged to arrive here, taken from `incomingFrom`. */
  incoming: Set<string>;
  incomingFrom: Map<string, CatalogEntry>;
  /** Names of this side staged to leave for the other side. */
  queued: Set<string>;
  filter: string;
  onFilter: (value: string) => void;
  selected: Set<string>;
  onSelect: (next: Set<string>) => void;
  onActivate: (name: string) => void;
  empty: string;
  footer: React.ReactNode;
}) {
  const { t } = useTranslation();
  const names = [...new Set([...own.keys(), ...incoming])]
    .filter(name => name.toLowerCase().includes(filter.trim().toLowerCase()))
    .sort((a, b) => a.localeCompare(b));
  const toggle = (name: string) => {
    const next = new Set(selected);
    if (!next.delete(name)) next.add(name);
    onSelect(next);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-2">
      <div className="flex h-9 items-center gap-2 px-1 font-medium">
        <ClientIcon client={clientIconId(client.id)} />
        {client.label}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
        <div className="border-b p-2">
          <Input value={filter} onChange={event => onFilter(event.target.value)} placeholder={t("manage.sync.filter")} className="h-8" />
        </div>
        <ul className="flex-1 overflow-y-auto p-1" role="listbox" aria-multiselectable>
          {names.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">{empty}</li>}
          {names.map(name => {
            const entry = own.get(name) ?? incomingFrom.get(name);
            if (!entry) return null;
            const arriving = incoming.has(name);
            const badge = arriving
              ? own.has(name)
                ? { label: t("manage.sync.overwrite"), variant: "destructive" as const }
                : { label: t("manage.sync.adding"), variant: "default" as const }
              : queued.has(name)
                ? { label: t("manage.sync.queued"), variant: "default" as const }
                : undefined;
            return (
              <li
                key={name}
                role="option"
                aria-selected={selected.has(name)}
                onClick={() => toggle(name)}
                onDoubleClick={() => onActivate(name)}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 hover:bg-accent",
                  selected.has(name) && "bg-primary/10 hover:bg-primary/15",
                )}
              >
                <PluginIcon name={entry.displayName ?? name} icon={entry.icon} iconUrl={entry.iconUrl} className="size-7 text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{entry.displayName ?? name}</div>
                  <div className="truncate text-xs text-muted-foreground">{entry.description}</div>
                </div>
                {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
              </li>
            );
          })}
        </ul>
        <div className="flex justify-between border-t p-1">{footer}</div>
      </div>
    </div>
  );
}
