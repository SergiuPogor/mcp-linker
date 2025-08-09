import { useProvider } from "@/hooks/useProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LlmProviderSelector() {
  const {
    selectedProvider,
    selectedModel,
    setSelectedModel,
    providers,
  } = useProvider();

  // Find the selected provider object
  const selectedProviderObj = providers.find(
    (p) => p.value === selectedProvider,
  );

  // Handle model selection
  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
  };

  return (
    <Select value={selectedModel} onValueChange={handleModelSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose model" />
      </SelectTrigger>
      <SelectContent>
        {selectedProviderObj?.models.map((model) => (
          <SelectItem key={model} value={model}>
            {model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}