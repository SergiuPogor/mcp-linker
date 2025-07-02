// hooks/useTier.ts
import { useAuth } from "@/hooks/useAuth";
import { useUserStore } from "@/stores/userStore";

export function useIsFreeUser() {
  const { isAuthenticated } = useAuth();
  const { user } = useUserStore();
  return isAuthenticated && user?.tier === "FREE";
}
