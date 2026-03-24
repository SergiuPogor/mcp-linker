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
import { Copy, RotateCcw, Save, User, Users } from "lucide-react";
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
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    const storedKey = getEncryptionKey(keyId);
    if (storedKey) {
      setKey("");
      setHasStoredKey(true);
    } else {
      setHasStoredKey(false);
    }
  }, [keyId]);

  const handleGenerateKey = async () => {
    try {
      setHasStoredKey(false);
      const newKey = await generateEncryptionKey();
      setKey(newKey);
      setShowKey(true);
      setHasViewedGeneratedKey(true);
      // Do not store or set hasStoredKey here; wait until save
      toast.success(
        `New encryption key generated. Please copy and store it safely. You won't be able to view it again after saving.`,
      );
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
      setHasStoredKey(true);
      // don't clear key here to allow copy after saving
      toast.success(
        "Encryption key saved successfully. You won't be able to view it again.",
      );
    } catch (error) {
      console.error("Error saving key:", error);
      toast.error("Failed to save encryption key");
    }
  };

  const handleCopyKey = () => {
    if (key && (showKey || hasViewedGeneratedKey)) {
      navigator.clipboard.writeText(key);
      toast.success("Key copied to clipboard");
    } else {
      toast.error("Please reveal or generate the key before copying");
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
          {hasStoredKey
            ? "Encryption key is set. You cannot view or retrieve it again. If you wish to change it, generate or enter a new key."
            : `View, generate or enter encryption key for ${keyName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`key-${keyId}`}>Encryption Key</Label>
          {!hasStoredKey && (
            <div className="flex gap-2">
              <Input
                id={`key-${keyId}`}
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setHasViewedGeneratedKey(true);
                }}
                placeholder="Enter or generate encryption key"
                className="font-mono text-sm"
              />
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
          )}
          {!hasStoredKey && !key.trim() && !hasViewedGeneratedKey && (
            <p className="text-destructive text-sm mt-1">
              Please generate or enter an encryption key to save.
            </p>
          )}
          {hasStoredKey && (
            <p className="text-muted-foreground text-sm mt-1">
              Key is securely stored. For security, you cannot view it again. To
              set a new key, generate or enter and save a new key.
            </p>
          )}
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
            disabled={hasStoredKey || !key.trim()}
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
