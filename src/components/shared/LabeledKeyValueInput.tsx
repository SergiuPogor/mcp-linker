import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LabeledKeyValueInputProps {
  k: string;
  v: string;
  placeholder?: string;
  onKeyChange: (newKey: string) => void;
  onValueChange: (newValue: string) => void;
  onRemove: () => void;
}

export const LabeledKeyValueInput = ({
  k,
  v,
  placeholder,
  onKeyChange,
  onValueChange,
  onRemove,
}: LabeledKeyValueInputProps) => (
  <div className="flex items-center gap-2">
    <Input
      className="col-span-1 dark:bg-gray-800 dark:border-gray-500 dark:text-white"
      value={k}
      onChange={(e) => onKeyChange(e.target.value)}
      required
    />
    <Input
      className="col-span-3 dark:bg-gray-800 dark:border-gray-500 dark:text-white"
      value={v}
      placeholder={placeholder}
      onChange={(e) => onValueChange(e.target.value)}
      required
    />
    <Button variant="ghost" size="icon" onClick={onRemove}>
      🗑️
    </Button>
  </div>
);
