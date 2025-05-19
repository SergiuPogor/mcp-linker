// ServerConfigDialogHeader.tsx
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ServerConfigDialogHeaderProps {
  title?: string;
  description?: string;
}

export const ServerConfigDialogHeader = ({
  title = "config",
  description = "server config",
}: ServerConfigDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="dark:text-white">{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
};
