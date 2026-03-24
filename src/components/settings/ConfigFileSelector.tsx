import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfigFileStore } from "@/stores/configFileStore";
import { useTeamStore } from "@/stores/team";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useState } from "react";

export function ConfigFileSelector() {
  const selectedTeamId = useTeamStore((state) => state.selectedTeamId);
  const { getTeamConfigPath, setTeamConfigPath } = useConfigFileStore();
  const [selectedPath, setSelectedPath] = useState<string>("");

  // Update selected path when team changes
  useEffect(() => {
    if (selectedTeamId) {
      const savedPath = getTeamConfigPath(selectedTeamId);
      setSelectedPath(savedPath || "");
    }
  }, [selectedTeamId, getTeamConfigPath]);

  const handleBrowse = async () => {
    try {
      // Only allow selecting JSON files in the dialog
      const path = await open({
        directory: false,
        multiple: false,
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });

      if (path && selectedTeamId) {
        setSelectedPath(path);
        setTeamConfigPath(selectedTeamId, path);
      }
    } catch (error) {
      console.error("Failed to select directory:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex space-x-2">
        <Input
          value={selectedPath}
          onChange={(e) => {
            const newPath = e.target.value;
            setSelectedPath(newPath);
            if (selectedTeamId) {
              setTeamConfigPath(selectedTeamId, newPath);
            }
          }}
          className="flex-1"
          placeholder="Select a team mcp config json"
          readOnly
        />
        <Button onClick={handleBrowse}>Choose</Button>
      </div>
    </div>
  );
}
