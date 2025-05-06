// ServerNameInput.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ServerNameInputProps {
  serverName: string;
  onChange: (value: string) => void;
}

export const ServerNameInput = ({
  serverName,
  onChange,
}: ServerNameInputProps) => {
  return (
    <div className="grid gap-2">
      <Label className="text-foreground dark:text-gray-200">Server Name</Label>
      <Input
        value={serverName || ""}
        onChange={(e) => onChange(e.target.value)}
        className="dark:bg-gray-800 dark:border-gray-500 dark:text-white"
      />
    </div>
  );
};
