// ServerConfigDialogHeader.tsx
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ServerConfigDialogHeaderProps {
  title?: string;
  description?: string;
}

export const ServerConfigDialogHeader = ({
  title = "mcp server config",
  description = "server config",
}: ServerConfigDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="dark:text-white">{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>
  );
};
