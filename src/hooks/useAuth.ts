import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Start as false to avoid blocking

  useEffect(() => {
    // If Supabase is not enabled, allow access without auth
    if (!isSupabaseEnabled || !supabase) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting session:", error);
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAuthEnabled: isSupabaseEnabled,
  };
};
