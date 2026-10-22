import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useViewStore } from "@/stores/viewStore";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type HomeKind = "skills" | "mcps" | "plugins";
export type HomeScope = "yours" | "discover";

const PATHS: Record<HomeKind, Record<HomeScope, string>> = {
  skills: { yours: "/skills", discover: "/skills?scope=discover" },
  mcps: { yours: "/manage", discover: "/discover" },
  plugins: { yours: "/plugins", discover: "/plugins?scope=discover" },
};

/** The home header: what you are looking at, whose it is, and the controls for it. */
export function HomeNav({ kind, scope, children }: { kind: HomeKind; scope: HomeScope; children?: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useViewStore(state => state.navigate);
  const kinds: { id: HomeKind; label: string }[] = [
    { id: "skills", label: t("nav.skills") },
    { id: "mcps", label: t("nav.mcps") },
    { id: "plugins", label: t("nav.plugins") },
  ];
  const scopes: { id: HomeScope; label: string }[] = [
    { id: "yours", label: t("nav.yours") },
    { id: "discover", label: t("nav.discover") },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <nav className="flex shrink-0 items-center gap-1" aria-label="Kind">
        {kinds.map(item => (
          <button
            key={item.id}
            type="button"
            aria-current={item.id === kind}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", item.id === kind ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}
            onClick={() => item.id !== kind && navigate(PATHS[item.id][scope])}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <Tabs value={scope} onValueChange={next => next !== scope && navigate(PATHS[kind][next as HomeScope])}>
        <TabsList>
          {scopes.map(item => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* Wraps under the nav on narrow windows and stays right-aligned there. */}
      {children && <div className="ml-auto flex min-w-fit flex-1 basis-[16rem] items-center justify-end gap-2">{children}</div>}
    </div>
  );
}
