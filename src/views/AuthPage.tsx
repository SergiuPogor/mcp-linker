import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase";
import { open } from "@tauri-apps/plugin-shell";
import { Github } from "lucide-react";

export default function AuthPage() {

  const handleGithubLogin = async () => {
    try {
      const { data } = await supabase.auth.signInWithOAuth({
        provider: "github",
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
      console.error("Error signing in with GitHub:", error);
      throw error;
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={handleGithubLogin}
          className="w-full flex items-center gap-2"
        >
          <Github />
          Continue with GitHub
        </Button>
      </div>
    </div>
  );
}
