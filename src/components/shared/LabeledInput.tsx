// LabeledInput.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const LabeledInput = ({
  label,
  value,
  onChange,
  placeholder,
}: LabeledInputProps) => {
  return (
    <div className="grid gap-2">
      <Label className="text-foreground dark:text-gray-200">{label}</Label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="dark:bg-gray-800 dark:border-gray-500 dark:text-white"
      />
    </div>
  );
};