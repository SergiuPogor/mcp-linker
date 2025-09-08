import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCCProjectStore } from "@/stores/ccProject";
import { useClientPathStore } from "@/stores/clientPathStore";
import { invoke } from "@tauri-apps/api/core";
import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function ProjectSelector() {
  const { projects, selectedProject, setProjects, setSelectedProject } =
    useCCProjectStore();
  const { setClientPath } = useClientPathStore();
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const list = await invoke<string[]>("claude_list_projects");
      setProjects(list);
      if (!selectedProject && list.length > 0) {
        setSelectedProject(list[0]);
      }
    } catch (e) {
      // swallow; specialized page will show detailed errors
    } finally {
      setLoading(false);
    }
  }, [selectedProject, setProjects, setSelectedProject]);

  useEffect(() => {
    // lazy load once the selector appears
    if (projects.length === 0) {
      loadProjects();
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedProject || undefined}
        onValueChange={(v) => {
          setSelectedProject(v);
          // Bridge to sync API: store workingDir into clientPath for claude_code
          setClientPath("claude_code", v || null);
        }}
      >
        <SelectTrigger className="min-w-[220px]">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={loadProjects}
        disabled={loading}
        className="flex items-center gap-2"
      >
        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}
