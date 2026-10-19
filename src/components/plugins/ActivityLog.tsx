import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { pluginActivity } from "@/lib/plugins";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

/** The client CLI calls behind the Plugins page, with their output, so a failed or slow action can be traced. */
export function ActivityDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { data = [] } = useQuery({ queryKey: ["plugin-activity"], queryFn: pluginActivity, enabled: open, refetchInterval: open ? 2000 : false });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("plugins.activity")}</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 space-y-3 overflow-auto">
          {data.length === 0 && <p className="text-sm text-muted-foreground">{t("plugins.activityEmpty")}</p>}
          {data.map(entry => (
            <div key={`${entry.at}-${entry.command}`} className="text-xs">
              <p className="flex items-center gap-2 font-mono">
                {entry.ok ? <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" /> : <XCircle className="size-3.5 shrink-0 text-destructive" />}
                <span className="break-all">{entry.command}</span>
                <span className="shrink-0 text-muted-foreground">{(entry.durationMs / 1000).toFixed(1)}s</span>
              </p>
              {entry.output.trim() && <pre className="mt-1 whitespace-pre-wrap break-all rounded bg-muted/40 p-2 text-muted-foreground">{entry.output.trim()}</pre>}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
