import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientOptions } from "@/constants/clients";
import { useAuth } from "@/hooks/useAuth";
import { useIsFreeUser } from "@/hooks/useTier";
import { useClientPathStore } from "@/stores/clientPathStore";

export function ClientSelector() {
  const { selectedClient, setSelectedClient } = useClientPathStore();
  const { isAuthenticated } = useAuth();
  const isFreeUser = useIsFreeUser();


  return (
    <div className="z-50">
      <Select value={selectedClient} onValueChange={setSelectedClient}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an application" />
        </SelectTrigger>
        <SelectContent>
        {clientOptions.map((option) => {
          const isDisabledForFreeUser =
          (isFreeUser && !option.free) || (!isAuthenticated && !option.free);
          return (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={isDisabledForFreeUser}
            >
              {option.label}
              {isDisabledForFreeUser && (
                <span className="text-red-500 text-xs ml-2">(Upgrade to Pro)</span>
              )}
            </SelectItem>
          );
        })}
      </SelectContent>
      </Select>
    </div>
  );
}
