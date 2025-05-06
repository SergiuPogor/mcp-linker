import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientOption {
  id: string;
  name: string;
}

const clientOptions: ClientOption[] = [
  { id: "claude", name: "Claude" },
  { id: "cursor", name: "Cursor" },
  { id: "windsurf", name: "Windsurf" },
  { id: "cline", name: "Cline" },
  { id: "vscode", name: "Vscode" },
  { id: "mcphub", name: "mcphub.nvim" },
  { id: "custom", name: "Custom" },
];

interface ClientSelectorProps {
  selectedClient: string;
  onChange: (app: string) => void;
}

export function ClientSelector({
  selectedClient,
  onChange,
}: ClientSelectorProps) {
  return (
    <div className="z-50">
      <Select value={selectedClient} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an application" />
        </SelectTrigger>
        <SelectContent>
          {clientOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
