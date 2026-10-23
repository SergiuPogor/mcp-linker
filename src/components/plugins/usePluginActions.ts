import { PLUGIN_CLIENTS, type PluginClient, type PluginUpdateCheck, copyPlugin, copyPlugins, installPlugin, otherClient, setPluginEnabled, updatePlugins } from "@/lib/plugins";
import { requirePro } from "@/stores/license";
import { type Progress, inSequence } from "@/lib/sequence";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Enable/disable and install for one client; both re-read the catalog from disk afterwards. */
export function usePluginActions(client: PluginClient, label: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["plugin-catalog", client] });
    queryClient.invalidateQueries({ queryKey: ["plugin-activity"] });
  };
  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => setPluginEnabled(client, id, enabled),
    onSuccess: refresh,
    onError: error => toast.error(message(error), { duration: 15_000 }),
  });
  const install = useMutation({
    mutationFn: (id: string) => installPlugin(client, id),
    onSuccess: (output, id) => {
      refresh();
      toast.success(t("plugins.installed", { id, client: label }), { description: output.trim() || undefined });
    },
    onError: error => {
      refresh();
      toast.error(message(error), { duration: 15_000 });
    },
  });
  const [updateProgress, setUpdateProgress] = useState<Progress | null>(null);
  const update = useMutation({
    mutationFn: (ids: string[]) => inSequence(ids, id => updatePlugins(client, [id]), (name, error) => ({ name, error, note: null }), setUpdateProgress),
    onSuccess: outcomes => {
      const failed = outcomes.filter(o => o.error);
      const ok = outcomes.filter(o => !o.error);
      if (ok.length) toast.success(t("plugins.updatedToast", { count: ok.length }), { description: [...new Set(ok.flatMap(o => (o.note ? [o.note] : [])))].join(" ") || undefined });
      if (failed.length) toast.error(t("plugins.updateFailed", { count: failed.length }), { description: failed.map(o => `${o.name}: ${o.error}`).join("\n"), duration: 15_000 });
      // What was updated is no longer pending; the rest stays until the next check.
      const done = new Set(ok.map(o => o.name));
      queryClient.setQueryData<PluginUpdateCheck>(["plugin-updates", client], old => old && { ...old, updates: old.updates.filter(u => !done.has(u.id)) }, { updatedAt: queryClient.getQueryState(["plugin-updates", client])?.dataUpdatedAt });
      refresh();
    },
    onError: error => toast.error(message(error), { duration: 15_000 }),
  });
  const target = otherClient(client);
  const targetLabel = PLUGIN_CLIENTS.find(c => c.id === target)?.label ?? target;
  const copyMutation = useMutation({
    mutationFn: (id: string) => copyPlugin(client, target, id),
    onSuccess: report => {
      queryClient.invalidateQueries({ queryKey: ["plugin-catalog", target] });
      queryClient.invalidateQueries({ queryKey: ["plugin-activity"] });
      toast.success(t("plugins.copied", { id: report.id, client: targetLabel }), {
        description: report.skipped.length ? t("plugins.leftOut", { parts: report.skipped.join(", ") }) : undefined,
      });
    },
    onError: error => toast.error(message(error), { duration: 15_000 }),
  });
  const copyManyMutation = useMutation({
    mutationFn: (ids: string[]) => copyPlugins(client, target, ids),
    onSuccess: results => {
      queryClient.invalidateQueries({ queryKey: ["plugin-catalog", target] });
      queryClient.invalidateQueries({ queryKey: ["plugin-activity"] });
      const failed = results.filter(r => r.error);
      const left = [...new Set(results.flatMap(r => r.report?.skipped ?? []))];
      if (results.length > failed.length) {
        toast.success(t("plugins.copiedMany", { count: results.length - failed.length, client: targetLabel }), {
          description: left.length ? t("plugins.leftOut", { parts: left.join(", ") }) : undefined,
        });
      }
      if (failed.length) toast.error(t("plugins.copyFailed", { count: failed.length }), { description: failed.map(r => `${r.id}: ${r.error}`).join("\n"), duration: 15_000 });
    },
    onError: error => toast.error(message(error), { duration: 15_000 }),
  });
  /** Copies installed plugins to the other client (Pro); `runMany` does a batch with one bridge refresh. */
  const copy = {
    target,
    targetLabel,
    isPending: copyMutation.isPending,
    variables: copyMutation.variables,
    run: (id: string) => requirePro("pluginSync") && copyMutation.mutate(id),
    manyPending: copyManyMutation.isPending,
    runMany: (ids: string[], onDone?: () => void) => requirePro("pluginSync") && copyManyMutation.mutate(ids, { onSuccess: onDone }),
  };
  return { toggle, install, update, updateProgress, copy, refresh };
}
