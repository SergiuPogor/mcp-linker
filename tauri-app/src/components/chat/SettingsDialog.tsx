import { useState } from "react";
import { useProvider } from "@/hooks/useProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Eye, EyeOff } from "lucide-react";
import type { Provider } from "@/types/chat";

interface SettingsDialogProps {
  children?: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const {
    providers,
    selectedProvider,
    setSelectedProvider,
    apiKey,
    setApiKey,
    models,
    selectedModel,
    setSelectedModel,
    baseUrl,
    setBaseUrl,
    selectedProviderConfig,
  } = useProvider();

  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);

  const handleSave = () => {
    setApiKey(tempApiKey);
    setBaseUrl(tempBaseUrl);
  };

  const handleProviderChange = (provider: Provider) => {
    setSelectedProvider(provider);
    // Load the API key for the new provider
    const providerApiKey = localStorage.getItem(`${provider}_API_KEY`) || "";
    setTempApiKey(providerApiKey);
    
    // Load the base URL for the new provider
    const providerConfig = providers.find((p) => p.value === provider);
    const storedUrl = localStorage.getItem(`${provider}_BASE_URL`);
    setTempBaseUrl(storedUrl || providerConfig?.defaultBaseUrl || "");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
          <DialogDescription>
            Configure your AI provider, model, and API settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apikey">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="apikey"
                  type={showApiKey ? "text" : "password"}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={`Enter your ${selectedProviderConfig?.label} API key`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never shared.
            </p>
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="baseurl">Base URL</Label>
            <Input
              id="baseurl"
              value={tempBaseUrl}
              onChange={(e) => setTempBaseUrl(e.target.value)}
              placeholder={selectedProviderConfig?.defaultBaseUrl}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the default URL for {selectedProviderConfig?.label}.
            </p>
          </div>

          {/* API Key Status */}
          <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {apiKey ? 'API Key configured' : 'API Key required'}
            </span>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <DialogTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button onClick={handleSave}>Save Settings</Button>
            </DialogTrigger>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}