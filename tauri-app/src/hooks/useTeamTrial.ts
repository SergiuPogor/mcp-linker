import { api } from "@/lib/api";
import { useUserStore } from "@/stores/userStore";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

/**
 * Custom hook to encapsulate team trial logic.
 * Provides loading state, trial status, and a function to start the trial.
 */
export function useTeamTrial() {
  const { user, loading: userLoading, fetchUser } = useUserStore();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Whether the user is a TEAM user
  const isTeamUser = user?.tier === "TEAM";
  // Whether the user has an active trial
  const isTrialActive = !!user?.trialActive;
  // Whether the trial has expired
  const isTrialExpired =
    isTrialActive &&
    user?.trialEndsAt &&
    new Date(user.trialEndsAt).getTime() <= Date.now();
  // Whether the user is eligible to start a trial
  const isEligibleForTrial = !isTeamUser && !isTrialActive;

  /**
   * Start the team trial for the user.
   */
  const startTrial = useCallback(async () => {
    setLoading(true);
    try {
      await api.post("/users/start-trial");
      toast.success("Trial started! Enjoy your 7-day free access.");
      setTimeout(() => {
        navigate(0);
      }, 1200);
    } catch (e: any) {
      toast.error(
        e?.message || "Failed to start trial. Please try again later.",
      );
      setLoading(false);
    }
  }, [navigate]);

  return {
    loading,
    userLoading,
    isTeamUser,
    isTrialActive,
    isTrialExpired,
    isEligibleForTrial,
    startTrial,
    fetchUser,
  };
}
