import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientOptions } from "@/constants/clients";
import { useConfigScopeStore } from "@/stores";
import { useClientPathStore } from "@/stores/clientPathStore";
import { useNavigate } from "react-router-dom";

export function ClientSelector() {
  const { selectedClient, setSelectedClient } = useClientPathStore();
  const navigate = useNavigate();

  function handleChange(value: string) {
    if (value === "claude_code") {
      navigate("/claude-code-manage");
    } else {
      setSelectedClient(value);
    }
  }

  return (
    <div className="z-50">
      <Select value={selectedClient} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clientOptions.map((option) => {
            return (
              <SelectItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

const configScopes = [
  { label: "Personal", value: "personal" },
  { label: "Team", value: "team" },
];

export function ConfigScopeSelector() {
  const { scope, setScope } = useConfigScopeStore();

  return (
    <div className="z-50">
      <Select value={scope} onValueChange={setScope}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select scope" />
        </SelectTrigger>
        <SelectContent>
          {configScopes.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
