import { useTheme } from "@/components/theme-provider";
import {
  Card,
  CardContent,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

const OPTIONS = [
  { value: "light", icon: Sun, label: "themeLight" },
  { value: "dark", icon: Moon, label: "themeDark" },
  { value: "system", icon: Monitor, label: "themeSystem" },
] as const;

export default function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          {t("theme")}
        </CardTitle>
        <div className="flex gap-1 rounded-md border p-1">
          {OPTIONS.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={theme === value ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              title={t(label)}
              aria-pressed={theme === value}
              onClick={() => setTheme(value)}
            >
              <Icon />
              <span className="sr-only">{t(label)}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
