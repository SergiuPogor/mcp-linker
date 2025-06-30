import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { open } from "@tauri-apps/plugin-shell";
import { AlertCircle, Github } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function AuthPage() {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseEnabled || !supabase) {
      setError("Authentication is not configured");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      alert("Please check your email for the confirmation link!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseEnabled || !supabase) {
      setError("Authentication is not configured");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log("nav to onboarding after email login");
      navigate("/onboarding");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
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
        {import.meta.env.DEV && (
          <Tabs defaultValue="signin" className="w-full mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      localStorage.setItem("email", e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // localStorage.setItem("email", e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {import.meta.env.DEV && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        )}

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
      <span className="text-sm text-gray-500 mt-4">
        We respect your privacy. Usage data may be collected to improve the
        experience.
      </span>
    </div>
  );
}
