// hooks/useAuthContext.ts
import { getSession, signOut } from "@/services/auth";
import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthEnabled: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    // Skip if Supabase is not enabled
    if (!isSupabaseEnabled || !supabase) {
      setSession(null);
      return;
    }

    try {
      const newSession = await getSession();
      setSession(newSession);
    } catch (error) {
      console.error("Error refreshing session:", error);
      setSession(null);
    }
  };

  useEffect(() => {
    // If Supabase is not enabled, skip authentication setup
    if (!isSupabaseEnabled || !supabase) {
      setSession(null);
      setLoading(false);
      return;
    }

    // Get initial session
    refreshSession().finally(() => setLoading(false));

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    if (!isSupabaseEnabled || !supabase) {
      return;
    }

    await signOut();
    setSession(null);
  };

  const value = {
    user: session?.user ?? null,
    session,
    loading,
    isAuthenticated: !!session?.user,
    isAuthEnabled: isSupabaseEnabled,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
