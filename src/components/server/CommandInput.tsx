// CommandInput.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CommandInputProps {
  command: string;
  onChange: (value: string) => void;
}

export const CommandInput = ({ command, onChange }: CommandInputProps) => {
  return (
    <div className="grid gap-2">
      <Label className="text-foreground dark:text-gray-200">
        Command
      </Label>
      <Input
        value={command || ""}
        onChange={(e) => onChange(e.target.value)}
        className="dark:bg-gray-800 dark:border-gray-500 dark:text-white"
      />
    </div>
  );
};
