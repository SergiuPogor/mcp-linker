import { Switch } from "@/components/ui/switch";

interface ServerStatusSwitchProps {
  serverName: string;
  isActive: boolean;
  onEnable: (serverName: string) => Promise<void>;
  onDisable: (serverName: string) => Promise<void>;
}

export function ServerStatusSwitch({
  serverName,
  isActive,
  onEnable,
  onDisable,
}: ServerStatusSwitchProps) {
  return (
    <div className="flex items-center">
      <Switch
        checked={isActive}
        onCheckedChange={(checked) => {
          if (checked) {
            onEnable(serverName);
          } else {
            onDisable(serverName);
          }
        }}
        className="data-[state=checked]:bg-green-600"
      />
    </div>
  );
}
