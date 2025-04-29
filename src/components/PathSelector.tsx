import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PathSelectorProps {
  selectedPath: string;
  onChange: (path: string) => void;
}

export function PathSelector({ selectedPath, onChange }: PathSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBrowse = async () => {
    try {
      setIsLoading(true);
      const selectedPath = await open({
        directory: true,
        multiple: false,
      });

      if (selectedPath) {
        onChange(selectedPath);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex space-x-2">
        <Input
          value={selectedPath}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="Select a directory..."
          readOnly
        />
        <Button onClick={handleBrowse} disabled={isLoading}>
          {isLoading ? "Loading..." : "Browse"}
        </Button>
      </div>
    </div>
  );
}
