import { Button } from "@/components/ui/button";
import { Progress as Bar } from "@/components/ui/progress";
import type { Progress } from "@/lib/sequence";
import { timeAgo } from "@/lib/time";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface UpdateSectionProps {
  /** Heading above the cards, e.g. "3 updates available". */
  title: string;
  /** What to say when there are none. */
  upToDate: string;
  count: number;
  /** When the check ran (ms since the epoch). */
  checkedAt: number;
  /** Sources that could not be checked, so what they hold is not covered. */
  failures?: { name: string; error: string }[];
  progress: Progress | null;
  disabled: boolean;
  onUpdateAll: () => void;
  /** The update cards. */
  children?: ReactNode;
}

/** The result of a check, App Store style: when it ran, what could not be checked, the pending updates and Update all with its progress. */
export function UpdateSection({ title, upToDate, count, checkedAt, failures = [], progress, disabled, onUpdateAll, children }: UpdateSectionProps) {
  const { t, i18n } = useTranslation();
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="flex-1 text-sm font-semibold">{count > 0 ? title : upToDate}</h2>
        <span className="text-xs text-muted-foreground">{t("skills.checkedAt", { when: timeAgo(checkedAt, i18n.language) })}</span>
        {count > 0 && (
          <Button variant="outline" size="sm" className="rounded-full" disabled={disabled || progress !== null} onClick={onUpdateAll}>
            {progress ? t("skills.updateProgress", { done: progress.done, total: progress.total }) : t("skills.updateAll")}
          </Button>
        )}
      </div>
      {progress && progress.total > 1 && <Bar value={(progress.done / progress.total) * 100} className="h-1" />}
      {failures.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
          <p className="font-medium text-amber-700 dark:text-amber-500">{t("skills.checkFailed", { count: failures.length })}</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            {failures.map(failure => (
              <li key={failure.name} className="truncate" title={`${failure.name}: ${failure.error}`}>
                {failure.name}: {failure.error}
              </li>
            ))}
          </ul>
        </div>
      )}
      {children}
    </section>
  );
}
