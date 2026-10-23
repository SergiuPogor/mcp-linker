import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

interface UpdateCardProps {
  name: string;
  from?: string | null;
  to?: string | null;
  /** When the latest change was made (ISO 8601). */
  date?: string | null;
  /** Files that changed: omitted when the source cannot say, empty when it should have but could not. */
  files?: string[];
  /** How many files changed in all, when more than are listed. */
  total?: number;
  pending: boolean;
  disabled: boolean;
  onUpdate: () => void;
}

/** One pending update, App Store style: what it goes from and to, what changed on a click, and an Update button. */
export function UpdateCard({ name, from, to, date, files, total, pending, disabled, onUpdate }: UpdateCardProps) {
  const { t, i18n } = useTranslation();
  const count = total ?? files?.length ?? 0;
  return (
    <div className="min-w-0 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {from && to && <span className="font-mono">{t("skills.updateRefs", { from, to })}</span>}
            {from && to && date && " · "}
            {date && t("skills.updateCommitted", { when: timeAgo(date, i18n.language) })}
          </div>
        </div>
        <Button size="sm" className="rounded-full" disabled={disabled || pending} onClick={onUpdate}>
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {t("skills.update")}
        </Button>
      </div>
      {files === undefined ? null : files.length > 0 ? (
        <Collapsible className="mt-2">
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary [&[data-state=open]>svg]:rotate-90">
            <ChevronRight className="size-3.5 transition-transform" />
            {t("skills.whatsChanged")} · {t("skills.updateFiles", { count: count })}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-2 space-y-0.5 font-mono text-xs">
              {files.map(file => (
                <li key={file} className="truncate" title={file}>
                  {file}
                </li>
              ))}
              {count > files.length && <li className="text-muted-foreground">{t("skills.updateMore", { count: count - files.length })}</li>}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{t("skills.updateNoDiff")}</p>
      )}
    </div>
  );
}
