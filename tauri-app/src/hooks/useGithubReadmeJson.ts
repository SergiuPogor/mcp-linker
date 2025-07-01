import { useState } from "react";

/**
 * Custom hook to fetch all JSON code blocks from a GitHub repo's README.
 * @returns { loading, error, fetchAllJsonBlocks, fetchJson }
 */
export function useGithubReadmeJson() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all JSON code blocks from the README of the given GitHub repo URL.
   * @param githubUrl The GitHub repository URL
   * @returns Array of parsed JSON objects (or null for failed parses)
   */
  const fetchAllJsonBlocks = async (githubUrl: string): Promise<any[] | null> => {
    setError(null);
    setLoading(true);
    try {
      // Parse GitHub repo url
      const match = githubUrl.match(
        /github.com\/(?<owner>[^/]+)\/(?<repo>[^/?#]+)(?:[/?#]|$)/
      );
      if (!match || !match.groups) {
        setError("Invalid GitHub repository URL");
        setLoading(false);
        return null;
      }
      const { owner, repo } = match.groups;
      // Fetch README from GitHub API
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        setError("Failed to fetch README from GitHub");
        setLoading(false);
        return null;
      }
      const data = await res.json();
      if (!data.content) {
        setError("No README content found");
        setLoading(false);
        return null;
      }
      // Decode base64
      const readme = atob(data.content.replace(/\n/g, ""));
      // Extract all ```json ... ``` code blocks
      const jsonBlockMatches = [...readme.matchAll(/```json([\s\S]*?)```/g)];
      if (!jsonBlockMatches.length) {
        setError("No JSON code block found in README");
        setLoading(false);
        return null;
      }
      const results: any[] = [];
      for (const match of jsonBlockMatches) {
        const jsonStr = match[1];
        try {
          results.push(JSON.parse(jsonStr));
        } catch (e) {
          results.push(null); // Could not parse this block
        }
      }
      setLoading(false);
      return results;
    } catch (e: any) {
      setError("Unexpected error: " + e.message);
      setLoading(false);
      return null;
    }
  };

  /**
   * Fetches the first JSON code block from the README (for backward compatibility)
   */
  const fetchJson = async (githubUrl: string): Promise<any | null> => {
    const all = await fetchAllJsonBlocks(githubUrl);
    if (all && all.length > 0) return all[0];
    return null;
  };

  return { loading, error, fetchAllJsonBlocks, fetchJson };
} 