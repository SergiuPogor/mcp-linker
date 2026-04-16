import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Monitor, Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0">
      {theme === "light" ? <Sun /> : theme === "dark" ? <Moon /> : <Monitor />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
