import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useIsFreeUser } from "@/hooks/useTier";
import { useGlobalDialogStore } from "@/stores/globalDialogStore";
import { useStatsStore } from "@/stores/statsStore";

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
  const { isAuthenticated } = useAuth();
  const isFreeUser = useIsFreeUser();
  const personalStats = useStatsStore((s) => s.personalStats);
  const showGlobalDialog = useGlobalDialogStore((s) => s.showDialog);

  const isLimitedUser = !isAuthenticated || isFreeUser;

  const handleChange = (checked: boolean) => {
    // Limited users can only have 1 active server at a time
    if (checked && isLimitedUser && personalStats.active >= 1) {
      showGlobalDialog(isAuthenticated ? "upgrade" : "login");
      return;
    }
    if (checked) {
      onEnable(serverName);
    } else {
      onDisable(serverName);
    }
  };

  return (
    <div className="flex items-center">
      <Switch
        checked={isActive}
        onCheckedChange={handleChange}
        className="data-[state=checked]:bg-green-600"
      />
    </div>
  );
}
