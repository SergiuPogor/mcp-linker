// ConfigTabs.tsx
import { Button } from "@/components/ui/button";
import type { ServerConfig } from "@/types";

interface ConfigTabsProps {
  configs: ServerConfig[];
  curIndex: number;
  onConfigChange: (config: ServerConfig, index: number) => void;
}

export const ConfigTabs = ({
  configs,
  curIndex,
  onConfigChange,
}: ConfigTabsProps) => {
  return (
    <div className="flex gap-2">
      {configs.map((c, index) => (
        <Button
          key={`config-${index}-${Math.random()}`}
          onClick={() => onConfigChange(c, index)}
          variant={`${curIndex == index ? "default" : "outline"}`}
          aria-label={`Select configuration ${index + 1}`}
        >
          {"command" in c ? c.command : c.type || "Network"}
        </Button>
      ))}
    </div>
  );
};
