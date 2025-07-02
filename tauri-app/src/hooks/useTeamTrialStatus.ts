import { useUserStore } from "@/stores/userStore";
import { useMemo } from "react";

/**
 * Hook to get team trial and team user status.
 * Returns trialExpired, hasTrial, isTeamUser, isTeamOrTrialActive.
 * Optionally accepts a user object, otherwise uses userStore.
 */
export function useTeamTrialStatus(providedUser?: any) {
  // Get user from store if not provided
  const { user } = useUserStore();
  const actualUser = providedUser ?? user;

  // Memoize the status calculation
  return useMemo(() => {
    const trialExpired =
      actualUser?.trialActive &&
      actualUser?.trialEndsAt &&
      new Date(actualUser.trialEndsAt) <= new Date();
    const hasTrial = actualUser?.trialActive;
    const isTeamUser = actualUser?.tier === "TEAM";
    const isTeamOrTrialActive = isTeamUser || (hasTrial && !trialExpired);
    return { trialExpired, hasTrial, isTeamUser, isTeamOrTrialActive };
  }, [actualUser]);
}
