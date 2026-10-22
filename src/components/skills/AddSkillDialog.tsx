import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLUGIN_CLIENTS } from "@/lib/plugins";
import { type Discovered, discoverSkills, installSkills } from "@/lib/skills";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useSkillActions } from "./useSkillActions";

const message = (error: unknown) => (error instanceof Error ? error.message : String(error));

/** Two steps, like `npx skills add`: look inside a source, then install the skills you pick for both clients. */
export function AddSkillDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { refresh } = useSkillActions();
  const [source, setSource] = useState("");
  const [gitRef, setGitRef] = useState("");
  const [found, setFound] = useState<Discovered | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  const close = () => {
    onOpenChange(false);
    setFound(null);
    setPicked([]);
  };
  const find = useMutation({
    mutationFn: () => discoverSkills(source, gitRef),
    onSuccess: result => {
      setFound(result);
      setPicked(result.skills.map(s => s.name));
    },
    onError: error => toast.error(message(error), { duration: 15_000 }),
  });
  const install = useMutation({
    mutationFn: () => installSkills(source, picked, PLUGIN_CLIENTS.map(c => c.id), gitRef),
    onSuccess: outcomes => {
      const failed = outcomes.filter(o => o.error);
      if (failed.length) toast.error(failed.map(o => `${o.name}: ${o.error}`).join("\n"), { duration: 15_000 });
      if (failed.length < outcomes.length) toast.success(t("skills.installedToast", { count: outcomes.length - failed.length }));
      refresh();
      close();
    },
    onError: error => toast.error(message(error), { duration: 15_000 }),
  });

  return (
    <Dialog open={open} onOpenChange={next => !next && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("skills.addTitle")}</DialogTitle>
          <DialogDescription>{t("skills.addHint")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={event => {
            event.preventDefault();
            if (source.trim()) find.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="skill-source">{t("skills.sourceLabel")}</Label>
            <Input
              id="skill-source"
              autoFocus
              value={source}
              onChange={event => {
                setSource(event.target.value);
                setFound(null);
              }}
              placeholder={t("skills.sourcePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-ref">{t("skills.gitRef")}</Label>
            <Input id="skill-ref" value={gitRef} onChange={event => setGitRef(event.target.value)} placeholder="main" />
          </div>
          {!found && (
            <DialogFooter>
              <Button type="submit" disabled={!source.trim() || find.isPending}>
                {find.isPending && <Loader2 className="size-4 animate-spin" />}
                {t("skills.find")}
              </Button>
            </DialogFooter>
          )}
        </form>

        {found && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("skills.found", { count: found.skills.length, source: found.source })}</p>
            <ul className="max-h-64 divide-y overflow-y-auto rounded-xl border">
              {found.skills.map(skill => (
                <li key={skill.name}>
                  <label className="flex cursor-pointer items-start gap-3 px-3 py-2">
                    <Checkbox
                      className="mt-1"
                      checked={picked.includes(skill.name)}
                      onCheckedChange={on => setPicked(on ? [...picked, skill.name] : picked.filter(n => n !== skill.name))}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{skill.name}</span>
                      {skill.description && <span className="line-clamp-2 text-xs text-muted-foreground">{skill.description}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={close}>
                {t("cancel")}
              </Button>
              <Button disabled={picked.length === 0 || install.isPending} onClick={() => install.mutate()}>
                {install.isPending && <Loader2 className="size-4 animate-spin" />}
                {t("skills.installSelected")} ({picked.length})
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
