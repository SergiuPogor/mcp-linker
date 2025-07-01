import { Button } from "@/components/ui/button";
import { useTeamTrial } from "@/hooks/useTeamTrial";

/**
 * Section for starting or showing the team trial state.
 * Handles loading, eligibility, and button UI.
 */
export function TeamTrialSection() {
  const { loading, isEligibleForTrial, startTrial } = useTeamTrial();

  // Show nothing if user is already TEAM or trial is active (handled elsewhere)
  if (!isEligibleForTrial) return null;

  // Show loading state when enabling trial
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground space-y-3">
        <span className="text-lg font-semibold animate-pulse">
          ✨ Enabling Team Mode...
        </span>
      </div>
    );
  }

  // Show trial start button
  return (
    <div className="flex flex-col justify-center items-center h-full text-center space-y-3 text-muted-foreground mb-4">
      <Button onClick={startTrial} className="mt-2">
        Start 7-day free Team Trial
      </Button>
    </div>
  );
}
