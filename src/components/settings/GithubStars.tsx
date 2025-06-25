// src/components/settings/GitHubStars.tsx
import { useQuery } from "@tanstack/react-query";
import { open } from "@tauri-apps/plugin-shell";
import { Github } from "lucide-react";

const fetchStarCount = async () => {
  const res = await fetch("https://api.github.com/repos/milisp/mcp-linker");
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.stargazers_count;
};

const GitHubStars = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["github-stars"],
    queryFn: fetchStarCount,
    staleTime: 1000 * 60 * 10, // 10 mins
  });

  return (
    <button
      onClick={() => open("https://github.com/milisp/mcp-linker")}
      rel="noopener noreferrer"
      className="flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <Github size={14} />
      Star
      <span className="font-semibold">{isLoading ? "…" : data}</span>
    </button>
  );
};

export default GitHubStars;
