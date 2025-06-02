import { Button } from "@/components/ui/button";
import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { open } from "@tauri-apps/plugin-shell";
import { AlertCircle, Github } from "lucide-react";

export default function AuthPage() {
  const handleOAuthLogin = async (provider: "github" | "google") => {
    if (!isSupabaseEnabled || !supabase) {
      console.error("Authentication is not configured");
      return;
    }

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

  // Show message when authentication is disabled
  if (!isSupabaseEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Authentication Unavailable</h1>
        <p className="mb-6 text-gray-500 max-w-md">
          Authentication features are currently disabled. Please configure
          Supabase environment variables to enable user authentication.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg text-sm text-left max-w-md">
          <p className="font-semibold mb-2">Required environment variables:</p>
          <code className="block text-xs">
            VITE_SUPABASE_URL=your_supabase_url
            <br />
            VITE_SUPABASE_ANON_KEY=your_supabase_key
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to MCP Linker</h1>
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
