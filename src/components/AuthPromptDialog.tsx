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
import { useViewStore } from "@/stores/viewStore";

interface AuthPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthPromptDialog = ({
  isOpen,
  onClose,
}: AuthPromptDialogProps) => {
  const { navigate } = useViewStore();

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
          <AlertDialogCancel onClick={onClose}>
            Go to Personal
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleLogin}>Log In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
