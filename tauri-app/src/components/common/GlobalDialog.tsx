import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { open as openUrl } from "@tauri-apps/plugin-shell";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * GlobalDialog for login or upgrade prompts
 * @param open - whether dialog is open
 * @param type - 'login' | 'upgrade' | 'startTrial'
 * @param onClose - close handler
 */
export function GlobalDialog({
  open,
  type,
  onClose,
}: {
  open: boolean;
  type: "login" | "upgrade" | "startTrial";
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "login"
              ? "Sign In to Continue"
              : type === "upgrade"
                ? "Unlock Pro Features"
                : "Start Your Free 14-Day Trial, No credit card required!"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {type === "login"
            ? "You need to login to use this feature."
            : type === "upgrade"
              ? "Upgrade to MCP Linker Pro to use this feature."
              : "Start a 14-day free trial to unlock all features. No credit card required."}
        </div>
        <DialogFooter>
          {type === "login" && (
            <Button
              onClick={() => {
                onClose();
                navigate("/auth");
              }}
            >
              Sign In
            </Button>
          )}
          {type === "upgrade" && (
            <Button
              onClick={() => {
                onClose();
                openUrl("https://mcp-linker.store/pricing");
              }}
            >
              Upgrade to Pro
            </Button>
          )}
          {type === "startTrial" && (
            <Button
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  await api.post("/users/start-trial");
                  toast.success(
                    "Trial started! Enjoy your 14-day free access.",
                  );
                  setTimeout(() => {
                    onClose();
                    navigate(0);
                  }, 1200);
                } catch (e: any) {
                  toast.error(
                    e?.message ||
                      "Failed to start trial. Please try again later.",
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? <span className="animate-spin mr-2">⏳</span> : null}
              Start Free Trial
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
