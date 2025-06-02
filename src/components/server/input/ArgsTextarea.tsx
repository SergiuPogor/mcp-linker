// ArgsTextarea.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRepoUrlStore } from "@/stores/repoUrl";
import { parseGitHubRepoUrl } from "@/utils/urlHelper";
import { invoke } from "@tauri-apps/api/core";
import { Github } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

interface ArgsTextareaProps {
  args: string[];
  onChange: (value: string) => void;
}

export const ArgsTextarea = ({ args, onChange }: ArgsTextareaProps) => {
  const repoUrl = useRepoUrlStore((state) => state.repoUrl);
  const [isRepo, repo, repoFullName] = parseGitHubRepoUrl(repoUrl);
  useEffect(() => {
    console.log(args, repoUrl);
  }, [args, repoUrl]);
  const containsPathText = args.some((arg) =>
    arg.toLowerCase().includes("path"),
  );
  console.log(containsPathText);
  const handleClone = async () => {
    try {
      let result = "";
      if (isRepo) {
        result = await invoke("git_clone", { url: repo });
      } else {
        result = await invoke("git_clone", { url: repoUrl });
      }
      console.log(result);
      toast.success(`git clone to ~/.cache/mcp-linker/${repoFullName}`);
    } catch (error) {
      toast.error("Failed to clone repository");
    }
  };
  return (
    <div className="grid gap-2">
      <Label className="text-foreground dark:text-gray-200">args</Label>
      <Textarea
        value={args.join(" ")}
        onChange={(e) => onChange(e.target.value)}
        className="dark:bg-gray-800 dark:border-gray-500 dark:text-white"
      />
      {isRepo && containsPathText && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleClone}
          aria-label="GitHub Clone to ~/.cache/mcp-linker"
        >
          <Github className="w-4 h-4 mr-1" />
          Clone
        </Button>
      )}
    </div>
  );
};
