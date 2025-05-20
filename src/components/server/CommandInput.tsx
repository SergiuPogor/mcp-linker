import { LabeledInput } from "@/components/shared/LabeledInput";

interface CommandInputProps {
  command?: string;
  onChange: (value: string) => void;
}

export const CommandInput = ({ command, onChange }: CommandInputProps) => {
  return (
    <LabeledInput label="Command" value={command || ""} onChange={onChange} />
  );
};
