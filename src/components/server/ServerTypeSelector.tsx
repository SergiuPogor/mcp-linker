import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServerTypeSelectorProps {
  serverType: string;
  setServerType: (value: string) => void;
}

export const ServerTypeSelector = ({
  serverType,
  setServerType,
}: ServerTypeSelectorProps) => {
  return (
    <Select defaultValue={serverType} onValueChange={setServerType}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a server type" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="stdio">Stdio</SelectItem>
          <SelectItem value="sse">SSE</SelectItem>
          <SelectItem value="http">http</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
