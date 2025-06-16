import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  generateEncryptionKey,
  getEncryptionKey,
  storeEncryptionKey,
} from "@/utils/encryption";
import { Copy, Eye, EyeOff, RotateCcw, Save, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface KeyCardProps {
  keyId: string;
  keyName: string;
  type: "personal" | "team";
}

export default function EncryptionKeyCard({
  keyId,
  keyName,
  type,
}: KeyCardProps) {
  const [key, setKey] = useState<string>("");
  const [showKey, setShowKey] = useState(false);
  const [hasViewedGeneratedKey, setHasViewedGeneratedKey] = useState(false);

  useEffect(() => {
    const storedKey = getEncryptionKey(keyId);
    if (storedKey) {
      setKey("•".repeat(16));
      setHasViewedGeneratedKey(false);
    }
  }, [keyId]);

  const handleGenerateKey = async () => {
    try {
      const newKey = await generateEncryptionKey();
      setKey(newKey);
      setShowKey(true); // 自动显示一次
      setHasViewedGeneratedKey(true);
      storeEncryptionKey(newKey, keyId);
      toast.success(`New encryption key generated and saved for ${keyName}`);
    } catch (error) {
      console.error("Error generating key:", error);
      toast.error("Failed to generate encryption key");
    }
  };

  const handleSaveKey = () => {
    if (!key.trim()) {
      toast.error("Please enter or generate an encryption key");
      return;
    }

    try {
      storeEncryptionKey(key, keyId);
      toast.success("Encryption key saved successfully");
    } catch (error) {
      console.error("Error saving key:", error);
      toast.error("Failed to save encryption key");
    }
  };

  const handleCopyKey = () => {
    if (key) {
      navigator.clipboard.writeText(key);
      toast.success("Key copied to clipboard");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === "personal" ? (
            <User className="w-5 h-5" />
          ) : (
            <span className="flex gap-2 items-center">
              <Users className="w-5 h-5" /> Team
            </span>
          )}
          {keyName} Encryption Key
        </CardTitle>
        <CardDescription>
          View, generate or enter encryption key for {keyName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`key-${keyId}`}>Encryption Key</Label>
          <div className="flex gap-2">
            <Input
              id={`key-${keyId}`}
              type={showKey ? "text" : "password"}
              value={showKey || hasViewedGeneratedKey ? key : "•".repeat(16)}
              onChange={(e) => {
                setKey(e.target.value);
                setHasViewedGeneratedKey(true); // 一旦编辑就算是已查看
              }}
              placeholder="Enter or generate encryption key"
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowKey(!showKey)}
              title={showKey ? "Hide key" : "Show key"}
            >
              {showKey ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyKey}
              disabled={!key}
              title="Copy key"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateKey}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Generate Key
          </Button>
          <Button
            onClick={handleSaveKey}
            disabled={!key.trim()}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Key
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
