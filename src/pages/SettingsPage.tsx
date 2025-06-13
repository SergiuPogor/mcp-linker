import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  generateEncryptionKey,
  getEncryptionKey,
  storeEncryptionKey,
} from "@/utils/encryption";
import { Copy, Key, RotateCcw, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingPage() {
  const [currentKey, setCurrentKey] = useState<string>("");
  const [newKey, setNewKey] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Load current encryption key
    const key = getEncryptionKey();
    if (key) {
      setCurrentKey(key);
    }
  }, []);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    try {
      const key = await generateEncryptionKey();
      setNewKey(key);
      toast.success("New encryption key generated");
    } catch (error) {
      console.error("Error generating key:", error);
      toast.error("Failed to generate encryption key");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveKey = () => {
    if (!newKey.trim()) {
      toast.error("Please enter or generate an encryption key");
      return;
    }

    try {
      storeEncryptionKey(newKey);
      setCurrentKey(newKey);
      setNewKey("");
      toast.success("Encryption key saved successfully");
    } catch (error) {
      console.error("Error saving key:", error);
      toast.error("Failed to save encryption key");
    }
  };

  const handleCopyCurrentKey = () => {
    if (currentKey) {
      navigator.clipboard.writeText(currentKey);
      toast.success("Current key copied to clipboard");
    }
  };

  const handleCopyNewKey = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      toast.success("New key copied to clipboard");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your encryption keys and security settings
        </p>
      </div>

      {/* Current Encryption Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Current Encryption Key
          </CardTitle>
          <CardDescription>
            Your current encryption key used to secure server configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-key">Current Key</Label>
            <div className="flex gap-2">
              <Textarea
                id="current-key"
                value={currentKey}
                readOnly
                placeholder="No encryption key set"
                className="font-mono text-sm resize-none"
                rows={3}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCurrentKey}
                disabled={!currentKey}
                title="Copy current key"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate New Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Generate New Encryption Key
          </CardTitle>
          <CardDescription>
            Generate a new encryption key or enter your own custom key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-key">New Key</Label>
            <div className="flex gap-2">
              <Textarea
                id="new-key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Enter custom key or generate one"
                className="font-mono text-sm resize-none"
                rows={3}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyNewKey}
                disabled={!newKey}
                title="Copy new key"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerateKey}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              {isGenerating ? "Generating..." : "Generate Key"}
            </Button>
            <Button
              onClick={handleSaveKey}
              disabled={!newKey.trim()}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-200">
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-orange-700 dark:text-orange-300">
          <ul className="space-y-1">
            <li>• Keep your encryption key safe and secure</li>
            <li>
              • Changing the key will require re-entering encrypted server
              configurations
            </li>
            <li>• Store a backup of your key in a secure location</li>
            <li>• Never share your encryption key with unauthorized persons</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
