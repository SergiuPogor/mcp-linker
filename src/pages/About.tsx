import { Discord, Github } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { homePageUrl } from "@/constants/home-page-url";
import { pricingUrl } from "@/lib/license";
import { useLicense } from "@/stores/license";
import { useViewStore } from "@/stores/viewStore";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { ExternalLink, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const LINKS = [
  { id: "github", icon: Github, url: "https://github.com/milisp/mcp-linker" },
  { id: "discord", icon: Discord, url: "https://discord.gg/zAjtD4kf5K" },
  { id: "issues", icon: ExternalLink, url: "https://github.com/milisp/mcp-linker/issues" },
  { id: "changelog", icon: ExternalLink, url: "https://github.com/milisp/mcp-linker/blob/main/CHANGELOG.md" },
] as const;

const MORE_APPS = [
  { id: "codexia", name: "Codexia", url: "https://www.milisp.dev/codexia" },
  { id: "plux", name: "Plux", url: "https://www.milisp.dev/plux" },
] as const;

export default function About() {
  const { t } = useTranslation();
  const navigate = useViewStore(state => state.navigate);
  const status = useLicense(state => state.status);
  const [version, setVersion] = useState("");

  useEffect(() => {
    getVersion().then(setVersion).catch(() => {});
    useLicense.getState().load().catch(error => toast.error(String(error)));
  }, []);

  const tier = status?.tier ?? "free";
  const updatesDate = status?.updatesUntil ? new Date(status.updatesUntil).toLocaleDateString() : null;

  return (
    <div className="container mx-auto px-6 py-8 max-w-3xl space-y-6">
      <div>
        <div>
          <button
            type="button"
            onClick={() => openUrl(homePageUrl)}
            className="text-3xl font-bold hover:underline"
          >
            MCP Linker
          </button>
          <p className="mt-1 text-sm text-muted-foreground">
            {version && t("aboutPage.version", { version })}
          </p>
        </div>
      </div>

      <p className="text-muted-foreground">{t("aboutPage.tagline")}</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            {t(`aboutPage.tier.${tier}`)}
          </CardTitle>
          <CardDescription>
            {status?.licensed
              ? updatesDate
                ? t("license.updatesUntil", { date: updatesDate })
                : t("license.updatesLifetime")
              : t("aboutPage.freeNote")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {!status?.licensed && <Button onClick={() => openUrl(pricingUrl("about"))}>{t("license.buy")}</Button>}
          <Button variant="outline" onClick={() => navigate("/settings?section=license")}>
            {status?.licensed ? t("aboutPage.manageLicense") : t("upgrade.enterKey")}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LINKS.map(({ id, icon: Icon, url }) => (
          <Button key={id} variant="outline" onClick={() => openUrl(url)}>
            <Icon className="h-4 w-4 mr-2" />
            {t(`aboutPage.links.${id}`)}
          </Button>
        ))}
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="font-semibold">{t("aboutPage.moreTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("aboutPage.moreDesc")}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {MORE_APPS.map(app => (
            <button
              key={app.id}
              type="button"
              onClick={() => openUrl(app.url)}
              className="rounded-lg border p-4 text-left transition-colors hover:bg-accent"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold">{app.name}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{t(`aboutPage.apps.${app.id}`)}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
