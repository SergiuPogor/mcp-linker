import { PLUGIN_CLIENTS, type PluginClient } from "@/lib/plugins";
import { type CatalogSkill, type Outcome, type SkillUpdateReport, catalogSource, installSkills, setSkillClient, uninstallSkills, updateSkills } from "@/lib/skills";
import { type Progress, inSequence } from "@/lib/sequence";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));
export const clientLabel = (client: PluginClient) => PLUGIN_CLIENTS.find(c => c.id === client)?.label ?? client;
const ALL_CLIENTS = PLUGIN_CLIENTS.map(c => c.id);

/** Shows what a batch did: errors stay on screen, notes (things left alone) ride along. Returns how many succeeded. */
function useReport() {
  const { t } = useTranslation();
  return (outcomes: Outcome[], success: (count: number) => string) => {
    const failed = outcomes.filter(o => o.error);
    const ok = outcomes.length - failed.length;
    const notes = outcomes.flatMap(o => (o.note ? [o.note] : []));
    const text = ok > 0 ? success(ok) : "";
    if (text) toast.success(text, { description: notes.join(" ") || undefined });
    if (failed.length) toast.error(t("skills.someFailed", { count: failed.length }), { description: failed.map(o => `${o.name}: ${o.error}`).join("\n"), duration: 15_000 });
    return ok;
  };
}

/** Everything the Skills page changes; each action re-reads the skills from disk afterwards. */
export function useSkillActions() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const report = useReport();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["skills"] });
  const onError = (error: unknown) => toast.error(message(error), { duration: 15_000 });

  /** Link (or unlink) skills for one client. */
  const setClient = useMutation({
    mutationFn: ({ names, client, enabled }: { names: string[]; client: PluginClient; enabled: boolean }) => setSkillClient(names, client, enabled),
    onSuccess: (outcomes, { client, enabled }) => {
      report(outcomes, count => (enabled ? t("skills.syncedToast", { count, client: clientLabel(client) }) : ""));
      refresh();
    },
    onError,
  });

  /** Install catalog entries (one clone each, at the pinned commit when there is one). */
  const installCatalog = useMutation({
    mutationFn: async ({ skills, clients = ALL_CLIENTS }: { skills: CatalogSkill[]; clients?: PluginClient[] }) => {
      const outcomes: Outcome[] = [];
      for (const skill of skills) {
        try {
          outcomes.push(...(await installSkills(catalogSource(skill), [skill.name], clients, skill.sha)));
        } catch (error) {
          outcomes.push({ name: skill.name, error: message(error), note: null });
        }
      }
      return outcomes;
    },
    onSuccess: outcomes => {
      report(outcomes, count => t("skills.installedToast", { count }));
      refresh();
    },
    onError,
  });

  const uninstall = useMutation({
    mutationFn: (names: string[]) => uninstallSkills(names),
    onSuccess: outcomes => {
      report(outcomes, () => "");
      refresh();
    },
    onError,
  });

  const [updateProgress, setUpdateProgress] = useState<Progress | null>(null);
  const update = useMutation({
    mutationFn: (names: string[]) => inSequence(names, name => updateSkills([name]), (name, error) => ({ name, error, note: null }), setUpdateProgress),
    onSuccess: outcomes => {
      report(outcomes, count => t("skills.updatedToast", { count }));
      // What was updated is no longer pending; the rest stays until the next check.
      const done = new Set(outcomes.filter(o => !o.error).map(o => o.name));
      queryClient.setQueryData<SkillUpdateReport>(["skill-updates"], old => old && { ...old, updates: old.updates.filter(u => !done.has(u.name)) }, { updatedAt: queryClient.getQueryState(["skill-updates"])?.dataUpdatedAt });
      refresh();
    },
    onError,
  });

  return { setClient, installCatalog, uninstall, update, updateProgress, refresh };
}
