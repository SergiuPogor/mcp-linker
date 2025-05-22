import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase";
import { open } from "@tauri-apps/plugin-shell";
import { Github } from "lucide-react";

export default function AuthPage() {
  const handleOAuthLogin = async (provider: "github" | "google") => {
    try {
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

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to MCP-Linker</h1>
      <p className="mb-6 text-gray-500">Sign in to get more</p>

      <div className="w-full max-w-sm">
        <Button
          onClick={() => handleOAuthLogin("github")}
          className="w-full flex items-center justify-center gap-2 mb-4"
        >
          <Github />
          Continue with GitHub
        </Button>
        <Button
          onClick={() => handleOAuthLogin("google")}
          className="w-full flex items-center justify-center gap-2"
          variant="outline"
        >
          <span className="text-sm">🔍</span>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
