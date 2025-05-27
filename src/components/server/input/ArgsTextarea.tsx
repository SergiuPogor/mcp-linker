// ArgsTextarea.tsx
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ArgsTextareaProps {
  args: string[];
  onChange: (value: string) => void;
}

export const ArgsTextarea = ({ args, onChange }: ArgsTextareaProps) => {
  return (
    <div className="grid gap-2">
      <Label className="text-foreground dark:text-gray-200">args</Label>
      <Textarea
        value={args.join(" ")}
        onChange={(e) => onChange(e.target.value)}
        className="dark:bg-gray-800 dark:border-gray-500 dark:text-white"
      />
    </div>
  );
};
