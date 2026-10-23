import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { SkillUpdate } from "@/lib/skills";
import { ChevronRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/** "5 minutes ago" in the app's language, so a commit minutes old reads as such. */
const timeAgo = (iso: string, language: string) => {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  if (Number.isNaN(seconds)) return iso;
  const format = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  for (const [unit, size] of [["day", 86400], ["hour", 3600], ["minute", 60]] as const) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(Math.round(seconds), "second");
};

/** One pending update, App Store style: what it goes from and to, what changed on a click, and an Update button. */
export function UpdateCard({ update, pending, disabled, onUpdate }: { update: SkillUpdate; pending: boolean; disabled: boolean; onUpdate: () => void }) {
  const { t, i18n } = useTranslation();
  const from = update.installedRef?.slice(0, 7);
  const to = update.latestRef?.slice(0, 7);
  const hasFiles = update.changedFiles.length > 0;
  return (
    <div className="min-w-0 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{update.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {from && to && <span className="font-mono">{t("skills.updateRefs", { from, to })}</span>}
            {from && to && update.latestDate && " · "}
            {update.latestDate && t("skills.updateCommitted", { when: timeAgo(update.latestDate, i18n.language) })}
          </div>
        </div>
        <Button size="sm" className="rounded-full" disabled={disabled || pending} onClick={onUpdate}>
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {t("skills.update")}
        </Button>
      </div>
      {hasFiles ? (
        <Collapsible className="mt-2">
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary [&[data-state=open]>svg]:rotate-90">
            <ChevronRight className="size-3.5 transition-transform" />
            {t("skills.whatsChanged")} · {t("skills.updateFiles", { count: update.changedTotal })}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 space-y-0.5 font-mono text-xs">
              {update.changedFiles.map(file => (
                <li key={file} className="truncate" title={file}>
                  {file}
                </li>
              ))}
              {update.changedTotal > update.changedFiles.length && <li className="text-muted-foreground">{t("skills.updateMore", { count: update.changedTotal - update.changedFiles.length })}</li>}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{t("skills.updateNoDiff")}</p>
      )}
    </div>
  );
}
