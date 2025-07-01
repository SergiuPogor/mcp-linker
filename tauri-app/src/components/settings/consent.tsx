import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConsentStore } from "@/stores/consentStore";
import { useEffect, useState } from "react";

export function ConsentDialog() {
  const hasAgreed = useConsentStore((state) => state.hasAgreedToTerms);
  const agreeToTerms = useConsentStore((state) => state.agreeToTerms);
  const declineTerms = useConsentStore((state) => state.declineTerms);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasAgreed) {
      setOpen(true);
    }
  }, [hasAgreed]);

  const handleAgree = () => {
    agreeToTerms();
    setOpen(false);
  };

  const handleDecline = () => {
    declineTerms();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Terms and Conditions</DialogTitle>
        <div>
          Please agree to the terms before using the app.
          <br />
          <br />
          <b>
            server name and client name data may be collected to improve the
            experience.
          </b>
          <br />
          By clicking Agree, you consent to the collection of usage data as
          described. You can disable any time at setting page.
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
