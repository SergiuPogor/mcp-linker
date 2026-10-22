import { ClientIcon } from "@/components/ClientIcon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PLUGIN_CLIENTS } from "@/lib/plugins";
import { type Skill, hasSkill, readSkill } from "@/lib/skills";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Markdown } from "./Markdown";
import { clientLabel, useSkillActions } from "./useSkillActions";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));
const clientIconId = (client: string) => (client === "claude-code" ? "claude_code" : "codex");

/** One installed skill: its SKILL.md rendered, the files next to it, and the clients it is on. */
export function SkillDetail({ skill, outdated, onBack, onUninstall }: { skill: Skill; outdated: boolean; onBack: () => void; onUninstall: () => void }) {
  const { t } = useTranslation();
  const { setClient, update } = useSkillActions();
  const { data, error, isLoading } = useQuery({ queryKey: ["skills", "doc", skill.name], queryFn: () => readSkill(skill.name) });

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="size-4" />
        {t("skills.back")}
      </Button>

      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-semibold">{skill.name}</h2>
          <p className="truncate text-sm text-muted-foreground">{skill.source ?? t("skills.handMade")}</p>
        </div>
        <div className="flex items-center gap-4">
          {PLUGIN_CLIENTS.map(client => (
            <label key={client.id} className="flex items-center gap-2 text-sm" title={t("skills.enabledIn", { client: client.label })}>
              <ClientIcon client={clientIconId(client.id)} className="size-4" />
              {client.label}
              <Switch
                checked={hasSkill(skill, client.id)}
                disabled={setClient.isPending}
                onCheckedChange={enabled => setClient.mutate({ names: [skill.name], client: client.id, enabled })}
                aria-label={t("skills.enabledIn", { client: clientLabel(client.id) })}
              />
            </label>
          ))}
        </div>
      </div>

      {outdated && (
        <Button variant="outline" disabled={update.isPending} onClick={() => update.mutate([skill.name])}>
          <RefreshCcw className={`size-4 ${update.isPending ? "animate-spin" : ""}`} />
          {t("skills.update")}
        </Button>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">{t("loading")}</p>}
      {error && <p className="text-sm text-destructive">{message(error)}</p>}
      {data && (
        <>
          <div className="rounded-xl border p-5">
            <Markdown>{data.markdown}</Markdown>
          </div>
          {data.files.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-medium">{t("skills.files")}</h3>
              <ul className="divide-y rounded-xl border font-mono text-xs text-muted-foreground">
                {data.files.map(file => (
                  <li key={file} className="px-4 py-2">
                    {file}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className="break-all font-mono text-xs text-muted-foreground">{data.path}</p>
        </>
      )}

      <Button variant="outline" className="text-destructive" onClick={onUninstall}>
        {t("skills.uninstall")}
      </Button>
    </div>
  );
}
