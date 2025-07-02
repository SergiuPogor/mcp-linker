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
  const declineTerms = useConsentStore((state) => state.declineTerms);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasAgreed) {
      setOpen(true);
    }
  }, [hasAgreed]);

  const handleAgree = () => {
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
          To use this app, please acknowledge the terms.
          <br />
          <br />
          <b>This app does not collect any data at this time.</b>
          <br />
          In the future, data may be collected to improve user experience, but
          you will be notified and can opt out.
          <br />
          <br />
          By clicking "Agree", you acknowledge this notice.
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
