import AuthUnavailable from "@/components/common/AuthUnavailable";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { open } from "@tauri-apps/plugin-shell";
import { Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AuthPage() {
  type Provider = "github" | "google";
  const lastProvider = useAuthStore((s) => s.lastOAuthProvider);
  const setLastOAuthProvider = useAuthStore((s) => s.setLastOAuthProvider);

  const handleOAuthLogin = async (provider: Provider) => {
    if (!isSupabaseEnabled || !supabase) {
      console.error("Authentication is not configured");
      return;
    }

    try {
      // Remember last used provider via zustand store
      setLastOAuthProvider(provider);

      const { data } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          skipBrowserRedirect: true,
          redirectTo: import.meta.env.VITE_REDIRECT_URL,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (!data?.url) throw new Error("No auth URL returned");
      open(data.url);
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      throw error;
    }
  };

  if (!isSupabaseEnabled) {
    return <AuthUnavailable />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to MCP Linker</h1>
      <p className="mb-6 text-gray-500 dark:text-gray-400">Sign in to get more</p>

      <div className="w-full max-w-sm">
        {/* OAuth providers */}
        <div className="relative mb-4">
          <Button
            onClick={() => handleOAuthLogin("github")}
            className="w-full flex items-center justify-center gap-2"
          >
            <Github />
            Continue with GitHub
          </Button>
          {lastProvider === "github" && (
            <Badge variant="outline" className="absolute -top-2 -right-2 text-xs bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
              Last used
            </Badge>
          )}
        </div>

        <div className="relative">
          <Button
            onClick={() => handleOAuthLogin("google")}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <span className="text-sm">🔍</span>
            Continue with Google
          </Button>
          {lastProvider === "google" && (
            <Badge variant="outline" className="absolute -top-2 -right-2 text-xs bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300">
              Last used
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
