import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTabStore } from "@/stores/tabStore";
import { useNavigate } from "react-router-dom";

interface AuthPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthPromptDialog = ({
  isOpen,
  onClose,
}: AuthPromptDialogProps) => {
  const navigate = useNavigate();
  const { setMainTab, setPersonalTab } = useTabStore();

  const handleGoToPersonal = () => {
    setMainTab("personal");
    setPersonalTab("personalLocal");
    onClose();
  };

  const handleLogin = () => {
    navigate("/auth");
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Authentication Required</AlertDialogTitle>
          <AlertDialogDescription>
            You are not logged in. Please log in to access team features, or
            switch to your personal server management.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleGoToPersonal}>
            Go to Personal
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleLogin}>Log In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
