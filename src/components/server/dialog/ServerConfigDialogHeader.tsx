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
}: ServerConfigDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription></DialogDescription>
    </DialogHeader>
  );
};
