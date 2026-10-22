import { ClientIcon } from "@/components/ClientIcon";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClients, hasProjectConfig, requiresConfigFile, takesPath } from "@/lib/clients";
import { listWorkspaces } from "@/components/settings/InstallationTarget";
import { claudeWrite, clientWrite, toClaudeRequest } from "@/lib/claude";
import { pickClientPath } from "@/lib/data";
import { requireSync } from "@/stores/license";
import { cn } from "@/lib/utils";
import {
  SCOPE_LABEL,
  type ServerMap,
  type Staged,
  basename,
  buildSourceOptions,
  changedFields,
  convertServer,
  ccSource,
  clientIdOf,
  describe,
  isCCSource,
  mergeOver,
  missingNames,
  parseCCSource,
  rightNamesOf,
  sidebarProjects,
  stageCopy,
  targetValueOf,
  toggleDelete as toggleDeleteStaged,
} from "./localSync";
import { type ClaudeCodeScope, useCCProjectStore } from "@/stores/ccProject";
import { useClientPathStore } from "@/stores/clientPathStore";
import { useProjectPreferences } from "@/stores/projectPreferences";
import { invoke } from "@tauri-apps/api/core";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsUpDown, ChevronsRight, FolderOpen, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const emptyStaged = (): Staged => ({ toCopy: new Set(), toDelete: new Set() });

async function readServers(client: string, path: string | null): Promise<ServerMap> {
  if (isCCSource(client)) {
    const { scope, dir } = parseCCSource(client);
    const list = await invoke<any[]>("claude_mcp_list", { workingDir: dir, scope });
    return Object.fromEntries((list || []).map(({ name, ...rest }) => [name, rest]));
  }
  const data = await invoke<any>("read_json_file", { clientName: client, path: path || undefined });
  return data?.mcpServers ?? {};
}

function useServers(client: string, path: string) {
  const [servers, setServers] = useState<ServerMap>({});
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    if (!client) return setServers({});
    setLoading(true);
    try {
      setServers(await readServers(client, path || null));
    } catch (error) {
      setServers({});
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }, [client, path]);
  useEffect(() => { load(); }, [load]);
  return { servers, loading, reload: load };
}

/** Two-pane copy in either direction between any two clients, Claude Code projects or scopes; copies and deletions are staged on both sides until saved. */
export function LocalSyncPanel({ onClose, onSaved }: {
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const { t } = useTranslation();
  const { selectedClient, selectedPath, getClientPath } = useClientPathStore();
  const { selectedProject, selectedScope } = useCCProjectStore();
  const visibleProjects = useProjectPreferences(state => state.preferences.claude_code?.visibleProjects);
  const projects = useMemo(() => sidebarProjects(visibleProjects, selectedProject), [visibleProjects, selectedProject]);
  const pathOf = useCallback((value: string) => (takesPath(value) ? getClientPath(value) || "" : ""), [getClientPath]);

  // The target starts as the sidebar's selection and follows it when that changes.
  const sidebarTarget = targetValueOf(selectedClient, selectedScope, selectedProject);
  const [toClient, setToClient] = useState(sidebarTarget);
  const sidebarPath = takesPath(selectedClient) ? selectedPath || "" : "";
  const [toPath, setToPath] = useState(sidebarPath);
  useEffect(() => {
    setToClient(sidebarTarget);
    setToPath(sidebarPath);
  }, [sidebarTarget, sidebarPath]);

  const [fromClient, setFromClient] = useState(() => localStorage.getItem("syncFromClient") || "");
  const [fromPath, setFromPath] = useState(() => pathOf(fromClient));
  const chooseFrom = (value: string) => {
    setFromClient(value);
    setFromPath(pathOf(value));
  };
  const chooseTo = (value: string) => {
    setToClient(value);
    setToPath(pathOf(value));
  };

  // The source list leaves out the target, except for path-based clients, where the path tells them apart.
  const excludeFrom = takesPath(toClient) ? "" : toClient;
  const fromOptions = useMemo(
    () => buildSourceOptions(projects, getClients().map(({ id, label }) => ({ value: id, label })), excludeFrom).sourceOptions,
    [projects, excludeFrom],
  );

  // Drop a remembered source that is no longer offered (it became the target, or its project left the sidebar).
  useEffect(() => {
    if (fromClient && !fromOptions.some(option => option.value === fromClient)) chooseFrom("");
  }, [fromClient, fromOptions]);
  useEffect(() => localStorage.setItem("syncFromClient", fromClient), [fromClient]);

  const { servers: source, loading, reload: reloadSource } = useServers(fromClient, fromPath);
  const { servers: target, loading: targetLoading, reload: reloadTarget } = useServers(toClient, toPath);
  const sameSide = !!fromClient && fromClient === toClient && fromPath === toPath;

  const [saving, setSaving] = useState(false);
  // Copies and deletions staged on each side; "left" is written to the source's config, "right" to the target's.
  const [left, setLeft] = useState<Staged>(emptyStaged);
  const [right, setRight] = useState<Staged>(emptyStaged);
  const [leftSel, setLeftSel] = useState<Set<string>>(new Set());
  const [rightSel, setRightSel] = useState<Set<string>>(new Set());
  const [leftFilter, setLeftFilter] = useState("");
  const [rightFilter, setRightFilter] = useState("");

  const resetStaged = () => {
    setLeft(emptyStaged());
    setRight(emptyStaged());
    setLeftSel(new Set());
    setRightSel(new Set());
  };

  // Either side changed; staged moves no longer apply.
  useEffect(resetStaged, [fromClient, fromPath, toClient, toPath]);

  const leftNames = useMemo(() => rightNamesOf(source, left.toCopy), [source, left.toCopy]);
  const rightNames = useMemo(() => rightNamesOf(target, right.toCopy), [target, right.toCopy]);
  const missingRight = missingNames(source, target, right.toCopy);
  const missingLeft = missingNames(target, source, left.toCopy);
  // For each server both sides have: what copying it across would change there (empty when identical).
  const changesBetween = (from: ServerMap, to: ServerMap) =>
    Object.fromEntries(Object.keys(from).filter(name => name in to).map(name => [name, changedFields(from[name], to[name])]));
  const changesRight = useMemo(() => changesBetween(source, target), [source, target]);
  const changesLeft = useMemo(() => changesBetween(target, source), [source, target]);
  const identical = (changes: Record<string, string[]>, name: string) => changes[name]?.length === 0;
  const overwritesRight = [...right.toCopy].filter(name => name in target);
  const overwritesLeft = [...left.toCopy].filter(name => name in source);
  const overwrites = overwritesLeft.length + overwritesRight.length;
  const [confirming, setConfirming] = useState(false);

  // Stage copies into one side. Only servers really present on the other side can be copied, and
  // a server is staged in one direction at a time.
  const copyRight = (names: string[]) => {
    const movable = names.filter(name => name in source && !identical(changesRight, name));
    setRight(stageCopy(right, movable));
    setLeft(({ toCopy, toDelete }) => ({ toCopy: new Set([...toCopy].filter(name => !movable.includes(name))), toDelete }));
    setLeftSel(new Set());
  };
  const copyLeft = (names: string[]) => {
    const movable = names.filter(name => name in target && !identical(changesLeft, name));
    setLeft(stageCopy(left, movable));
    setRight(({ toCopy, toDelete }) => ({ toCopy: new Set([...toCopy].filter(name => !movable.includes(name))), toDelete }));
    setRightSel(new Set());
  };
  const toggleDeleteLeft = (names: string[]) => {
    setLeft(toggleDeleteStaged(left, names));
    setLeftSel(new Set());
  };
  const toggleDeleteRight = (names: string[]) => {
    setRight(toggleDeleteStaged(right, names));
    setRightSel(new Set());
  };

  const writeSide = async (client: string, path: string, name: string, config?: Record<string, any>) => {
    if (isCCSource(client)) {
      const { scope, dir } = parseCCSource(client);
      if (scope !== "user" && !dir) throw new Error("Please select a Claude Code project");
      const where = { workingDir: dir, scope };
      return config
        ? claudeWrite("claude_mcp_add", { request: toClaudeRequest(name, config), ...where })
        : claudeWrite("claude_mcp_remove", { name, ...where });
    }
    const where = { clientName: client, path: path || undefined, serverName: name };
    return config
      ? clientWrite("update_mcp_server", { ...where, serverConfig: config })
      : clientWrite("remove_mcp_server", where);
  };

  const pending = left.toCopy.size + left.toDelete.size + right.toCopy.size + right.toDelete.size;

  const save = async (skipExisting = false) => {
    setConfirming(false);
    setSaving(true);
    let done = 0;
    const failures: string[] = [];
    // One at a time: every write rewrites the same config file. A bad entry
    // must not stop the rest.
    const run = async (name: string, write: () => Promise<unknown>) => {
      try {
        await write();
        done++;
      } catch (error) {
        failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    const writes = [
      { client: toClient, path: toPath, staged: right, own: target, other: source },
      { client: fromClient, path: fromPath, staged: left, own: source, other: target },
    ];
    try {
      for (const { client, path, staged, own, other } of writes) {
        for (const name of staged.toDelete) await run(name, () => writeSide(client, path, name));
        for (const name of staged.toCopy) {
          if (skipExisting && name in own) continue;
          await run(name, async () => writeSide(client, path, name, mergeOver(own[name], convertServer(clientIdOf(client), other[name]))));
        }
      }
    } finally {
      if (done) toast.success(t("manage.sync.saved", { count: done }));
      if (failures.length) toast.error(failures.join("\n"));
      resetStaged();
      await Promise.all([reloadSource(), reloadTarget(), onSaved()]);
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
          <ArrowLeft className="size-4" />
          {t("manage.sync.back")}
        </Button>
        <div className="flex items-center gap-2">
          {pending > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{t("manage.sync.pending", { count: pending })}</span>
              <Button variant="outline" size="sm" onClick={resetStaged} disabled={saving}>
                {t("manage.sync.reset")}
              </Button>
            </>
          )}
          <Button size="sm" onClick={() => requireSync(clientIdOf(fromClient), clientIdOf(toClient)) && (overwrites ? setConfirming(true) : save())} disabled={!pending || saving || sameSide}>
            {saving && <RefreshCw className="size-4 animate-spin" />}
            {t("save")}
          </Button>
        </div>
      </div>

      {sameSide && <p className="text-sm text-destructive">{t("manage.sync.sameSide")}</p>}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("manage.sync.overwriteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("manage.sync.overwriteBody")}</AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="max-h-60 space-y-1 overflow-y-auto text-sm">
            {[
              ...overwritesRight.map(name => ({ name, arrow: "→", fields: changesRight[name] })),
              ...overwritesLeft.map(name => ({ name, arrow: "←", fields: changesLeft[name] })),
            ].map(({ name, arrow, fields }) => (
              <li key={`${arrow}${name}`}>
                <span className="mr-2 text-muted-foreground">{arrow}</span>
                <span className="font-medium">{name}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">{fields?.join(", ")}</span>
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            {overwrites < left.toCopy.size + left.toDelete.size + right.toCopy.size + right.toDelete.size && (
              <Button variant="outline" onClick={() => save(true)}>{t("manage.sync.skipExisting")}</Button>
            )}
            <AlertDialogAction onClick={() => save()}>{t("manage.sync.overwriteConfirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] gap-x-3 gap-y-2">
        <ServerBox
          className="col-start-1"
          header={
            <SidePicker
              value={fromClient}
              onChange={chooseFrom}
              path={fromPath}
              onPathChange={setFromPath}
              other={{ client: toClient, path: toPath }}
              projects={projects}
              defaultProject={selectedProject}
              placeholder={t("manage.sync.pickSource")}
              pathPlaceholder={t("manage.sync.pathPlaceholder")}
              side="Source"
              disabled={saving}
            />
          }
          names={leftNames}
          filter={leftFilter}
          onFilter={setLeftFilter}
          selected={leftSel}
          onSelect={setLeftSel}
          onActivate={name => left.toCopy.has(name) ? toggleDeleteLeft([name]) : !sameSide && copyRight([name])}
          configOf={name => (left.toCopy.has(name) ? target[name] : source[name]) ?? {}}
          badgeOf={name =>
            left.toCopy.has(name)
              ? name in source
                ? { label: t("manage.sync.overwrite"), variant: "destructive", title: changesLeft[name]?.join(", ") }
                : { label: t("manage.sync.adding"), variant: "default" }
              : left.toDelete.has(name) ? { label: t("manage.sync.removing"), variant: "destructive" }
              : right.toCopy.has(name) ? { label: t("manage.sync.queued"), variant: "default" }
              : identical(changesRight, name) ? { label: t("manage.sync.identical"), variant: "secondary" }
              : name in target ? { label: t("manage.sync.differs"), variant: "outline", title: changesRight[name]?.join(", ") }
              : undefined}
          struck={left.toDelete}
          empty={loading ? t("loading") : fromClient ? t("manage.sync.empty") : t("manage.sync.pickSource")}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => toggleDeleteLeft([...leftSel])} disabled={!leftSel.size || saving}>
                <Trash2 className="size-4" />
                {t("manage.sync.deleteSelected")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => copyRight(missingRight)} disabled={!missingRight.length || saving || sameSide}>
                {t("manage.sync.copyMissing")}
                <ChevronsRight className="size-4" />
              </Button>
            </>
          }
        />

        <div className="col-start-2 row-start-2 flex flex-col items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label={t("manage.sync.copy")}
            title={t("manage.sync.copy")}
            onClick={() => copyRight([...leftSel])}
            disabled={!leftSel.size || saving || sameSide}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={t("manage.sync.copy")}
            title={t("manage.sync.copy")}
            onClick={() => copyLeft([...rightSel])}
            disabled={!rightSel.size || saving || sameSide}
          >
            <ChevronLeft />
          </Button>
        </div>

        <ServerBox
          className="col-start-3"
          header={
            <SidePicker
              value={toClient}
              onChange={chooseTo}
              path={toPath}
              onPathChange={setToPath}
              other={{ client: fromClient, path: fromPath }}
              projects={projects}
              defaultProject={selectedProject}
              placeholder={t("manage.sync.pickTarget")}
              pathPlaceholder={t("manage.sync.targetPathPlaceholder")}
              side="Target"
              disabled={saving}
            />
          }
          names={rightNames}
          filter={rightFilter}
          onFilter={setRightFilter}
          selected={rightSel}
          onSelect={setRightSel}
          onActivate={name => right.toCopy.has(name) ? toggleDeleteRight([name]) : !sameSide && copyLeft([name])}
          configOf={name => (right.toCopy.has(name) ? source[name] : target[name]) ?? {}}
          badgeOf={name =>
            right.toCopy.has(name)
              ? name in target
                ? { label: t("manage.sync.overwrite"), variant: "destructive", title: changesRight[name]?.join(", ") }
                : { label: t("manage.sync.adding"), variant: "default" }
              : right.toDelete.has(name) ? { label: t("manage.sync.removing"), variant: "destructive" }
              : left.toCopy.has(name) ? { label: t("manage.sync.queued"), variant: "default" }
              : undefined}
          struck={right.toDelete}
          empty={targetLoading ? t("loading") : toClient ? t("manage.sync.empty") : t("manage.sync.pickTarget")}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => copyLeft(missingLeft)} disabled={!missingLeft.length || saving || sameSide}>
                <ChevronsLeft className="size-4" />
                {t("manage.sync.copyMissing")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleDeleteRight([...rightSel])} disabled={!rightSel.size || saving}>
                <Trash2 className="size-4" />
                {t("manage.sync.deleteSelected")}
              </Button>
            </>
          }
        />
      </div>
    </div>
  );
}

type PathItem = { value: string; title: string; detail?: string };

/** One searchable list of project folders (or the user config) to choose a side's location from. */
function PathCombobox({ value, placeholder, items, isBlocked, onSelect, onBrowse, ariaLabel, disabled }: {
  value: string;
  placeholder: string;
  items: PathItem[];
  isBlocked: (value: string) => boolean;
  onSelect: (value: string) => void;
  onBrowse?: () => void;
  ariaLabel: string;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = items.find(item => item.value === value);
  const pick = (next: string) => { onSelect(next); setOpen(false); };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} aria-label={ariaLabel} className="min-w-0 flex-1 justify-between font-normal" disabled={disabled}>
          <span className="min-w-0 truncate">{current?.title ?? (value ? basename(value) : placeholder)}</span>
          <ChevronsUpDown className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Filter projects" />
          <CommandList>
            <CommandEmpty>No matching project.</CommandEmpty>
            <CommandGroup>
              {items.map(item => (
                <CommandItem
                  key={item.value || "user"}
                  value={`${item.title} ${item.detail ?? ""} ${item.value}`}
                  disabled={isBlocked(item.value)}
                  onSelect={() => pick(item.value)}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{item.title}</span>
                    {item.detail && <span className="break-all text-xs text-muted-foreground">{item.detail}</span>}
                  </span>
                  {item.value === value && <Check className="ml-auto" />}
                </CommandItem>
              ))}
            </CommandGroup>
            {onBrowse && (
              <CommandGroup>
                <CommandItem value="browse" forceMount onSelect={() => { setOpen(false); onBrowse(); }}>
                  <FolderOpen />
                  {t("manage.sync.browse")}…
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const projectItem = (dir: string): PathItem => ({ value: dir, title: basename(dir), detail: dir });

/** The folders the sidebar offers for an editor client: the user's list, else recent folders that have a config. */
function useEditorProjects(client: string, current: string) {
  const editor = hasProjectConfig(client);
  const saved = useProjectPreferences(state => state.preferences[client]?.visibleProjects);
  const [recent, setRecent] = useState<{ client: string; list: string[] }>({ client: "", list: [] });
  useEffect(() => {
    if (!editor || saved) return;
    let cancelled = false;
    listWorkspaces(client)
      .then(list => { if (!cancelled) setRecent({ client, list: list.filter(item => item.hasConfig).map(item => item.path) }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [editor, saved, client]);
  if (!editor) return [];
  return [...new Set([...(saved ?? (recent.client === client ? recent.list : [])), ...(current ? [current] : [])])];
}

/** Picks one side: a client, or a Claude Code scope and project, plus the project folder or config file for clients that take one. */
function SidePicker({ value, onChange, path, onPathChange, other, projects, defaultProject, placeholder, pathPlaceholder, side, disabled }: {
  value: string;
  onChange: (value: string) => void;
  path: string;
  onPathChange: (path: string) => void;
  /** The other side, which this side may not be. */
  other: { client: string; path: string };
  projects: string[];
  defaultProject: string | null;
  placeholder: string;
  pathPlaceholder: string;
  side: string;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(path);
  useEffect(() => setDraft(path), [path]);
  const editorProjects = useEditorProjects(value, path);

  // Path-based clients are told apart by their path, so only the path is blocked for them.
  const exclude = takesPath(other.client) ? "" : other.client;
  const { others, sourceOptions } = useMemo(
    () => buildSourceOptions(projects, getClients().map(({ id, label }) => ({ value: id, label })), exclude),
    [projects, exclude],
  );
  const cc = isCCSource(value) ? parseCCSource(value) : null;
  const isExcluded = (scope: ClaudeCodeScope, dir: string) => ccSource(scope, dir) === exclude;

  const pickClient = (next: string) => {
    if (next !== "claude_code") return onChange(next);
    onChange(sourceOptions.find(option => isCCSource(option.value))?.value ?? "");
  };
  const pickScope = (scope: ClaudeCodeScope) =>
    onChange(ccSource(scope, scope === "user" ? "" : cc?.dir || defaultProject || projects[0] || ""));

  const browse = async () => {
    const picked = await pickClientPath(value);
    if (picked) onPathChange(picked);
  };

  return (
    <div className="flex flex-col gap-2">
      <Select value={cc ? "claude_code" : value} onValueChange={pickClient} disabled={disabled}>
        <SelectTrigger className="w-full" aria-label={`${side} client`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="claude_code" textValue="Claude Code"><ClientIcon client="claude_code" />Claude Code</SelectItem>
          {others.map(option => (
            <SelectItem key={option.value} value={option.value} textValue={option.label}>
              <ClientIcon client={option.value} />
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {cc && (
        <div className="flex gap-2">
          <Select value={cc.scope} onValueChange={next => pickScope(next as ClaudeCodeScope)} disabled={disabled}>
            <SelectTrigger className="w-28" aria-label={`${side} scope`}><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["local", "project", "user"] as const).map(scope => (
                <SelectItem
                  key={scope}
                  value={scope}
                  disabled={scope === "user" ? isExcluded("user", "") : !projects.length || isExcluded(scope, cc.dir || defaultProject || "")}
                >
                  {SCOPE_LABEL[scope]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {cc.scope !== "user" && (
            <PathCombobox
              value={cc.dir}
              placeholder="Choose a project"
              items={projects.map(projectItem)}
              isBlocked={dir => isExcluded(cc.scope, dir)}
              onSelect={dir => onChange(ccSource(cc.scope, dir))}
              ariaLabel={`${side} project`}
              disabled={disabled}
            />
          )}
        </div>
      )}
      {hasProjectConfig(value) && (
        <div className="flex gap-2">
          <Select
            value={path ? "project" : "user"}
            onValueChange={scope => {
              if (scope === "user") return onPathChange("");
              const first = editorProjects.find(dir => !(other.client === value && other.path === dir));
              if (first) onPathChange(first);
              else void browse();
            }}
            disabled={disabled}
          >
            <SelectTrigger className="w-28" aria-label={`${side} scope`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="user" disabled={other.client === value && !other.path}>{SCOPE_LABEL.user}</SelectItem>
              <SelectItem value="project">{SCOPE_LABEL.project}</SelectItem>
            </SelectContent>
          </Select>
          {path && (
            <PathCombobox
              value={path}
              placeholder={pathPlaceholder}
              items={editorProjects.map(projectItem)}
              isBlocked={dir => other.client === value && other.path === dir}
              onSelect={onPathChange}
              onBrowse={browse}
              ariaLabel={`${side} project`}
              disabled={disabled}
            />
          )}
        </div>
      )}
      {requiresConfigFile(value) && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => draft !== path && onPathChange(draft)}
            placeholder={pathPlaceholder}
            disabled={disabled}
          />
          <Button variant="outline" onClick={browse} disabled={disabled}>{t("manage.sync.browse")}</Button>
        </div>
      )}
    </div>
  );
}

function ServerBox({ className, header, names, filter, onFilter, selected, onSelect, onActivate, configOf, badgeOf, struck, empty, footer }: {
  className?: string;
  header: React.ReactNode;
  names: string[];
  filter: string;
  onFilter: (value: string) => void;
  selected: Set<string>;
  onSelect: (next: Set<string>) => void;
  onActivate: (name: string) => void;
  configOf: (name: string) => Record<string, any>;
  badgeOf: (name: string) => { label: string; variant: "default" | "secondary" | "destructive" | "outline"; title?: string } | undefined;
  struck?: Set<string>;
  empty: string;
  footer: React.ReactNode;
}) {
  const { t } = useTranslation();
  const visible = names
    .filter(name => name.toLowerCase().includes(filter.trim().toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (!next.delete(name)) next.add(name);
    onSelect(next);
  };

  return (
    <div className={cn("row-span-2 row-start-1 grid min-w-0 grid-rows-subgrid", className)}>
      {header}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-md border">
        <div className="border-b p-2">
          <Input value={filter} onChange={e => onFilter(e.target.value)} placeholder={t("manage.sync.filter")} className="h-8" />
        </div>
        <ul className="min-h-40 flex-1 overflow-y-auto p-1" role="listbox" aria-multiselectable>
          {visible.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted-foreground">{empty}</li>}
          {visible.map(name => {
            const badge = badgeOf(name);
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
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-sm font-medium", struck?.has(name) && "text-muted-foreground line-through")}>{name}</div>
                  <div className="truncate font-mono text-xs text-muted-foreground">{describe(configOf(name))}</div>
                </div>
                {badge && <Badge variant={badge.variant} title={badge.title}>{badge.label}</Badge>}
              </li>
            );
          })}
        </ul>
        <div className="flex justify-between border-t p-1">{footer}</div>
      </div>
    </div>
  );
}
