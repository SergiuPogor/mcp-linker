import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConsentStore } from "@/stores/consentStore";

export function ConsentDialog() {
  const hasAgreed = useConsentStore((state) => state.hasAgreedToTerms);
  const setHasAgreed = useConsentStore((state) => state.setHasAgreedToTerms);
  const setTelemetryEnabled = useConsentStore(
    (state) => state.setTelemetryEnabled,
  );

  const handleAgree = () => {
    setHasAgreed(true); // This will also enable telemetry
  };

  const handleDecline = () => {
    setHasAgreed(true); // Mark as seen so dialog won't show again
    setTelemetryEnabled(false); // Disable telemetry explicitly
  };

  return (
    <Dialog open={!hasAgreed}>
      <DialogContent>
        <DialogTitle>Terms and Conditions</DialogTitle>
        <div>
          Please agree to the terms before using the app.
          <br />
          <br />
          <b>Usage data may be collected to improve the experience.</b>
          <br />
          By clicking Agree, you consent to the collection of usage data as
          described.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDecline}>
            Decline
          </Button>
          <Button onClick={handleAgree}>Agree</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
