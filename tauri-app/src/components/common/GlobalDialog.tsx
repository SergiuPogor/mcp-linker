import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

/**
 * GlobalDialog for login or upgrade prompts
 * @param open - whether dialog is open
 * @param type - 'login' | 'upgrade'
 * @param onClose - close handler
 */
export function GlobalDialog({
  open,
  type,
  onClose,
}: {
  open: boolean;
  type: "login" | "upgrade";
  onClose: () => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "login" ? "Login Required" : "Upgrade Required"}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {type === "login"
            ? "You need to login to use this feature."
            : "Upgrade to MCP Linker Pro to use this feature."}
        </div>
        <DialogFooter>
          {type === "login" ? (
            <Button
              onClick={() => {
                onClose();
                navigate("/auth");
              }}
            >
              Go to Login
            </Button>
          ) : (
            <Button
              onClick={() => {
                onClose();
                window.open("https://mcp-linker.store/pricing", "_blank");
              }}
            >
              Upgrade Now
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
