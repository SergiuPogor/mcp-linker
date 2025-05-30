import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to prevent race conditions
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);

  useEffect(() => {
    // If Supabase is not enabled, allow access without auth
    if (!isSupabaseEnabled || !supabase) {
      setUser(null);
      setLoading(false);
      setSessionCheckComplete(true);
      return;
    }

    let isMounted = true; // Prevent state updates after unmount

    // Get initial session with retry mechanism for Windows timing issues
    const getInitialSession = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase client is not initialized");
        }
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }

        setLoading(false);
        setSessionCheckComplete(true);
      } catch (error) {
        console.error("Error getting session:", error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setSessionCheckComplete(true);
        }
      }
    };

    // Add small delay for Windows to ensure proper initialization
    const initDelay = navigator.platform.toLowerCase().includes("win")
      ? 100
      : 0;

    const timer = setTimeout(() => {
      getInitialSession();
    }, initDelay);

    // Listen for auth changes with enhanced error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, !!session?.user);

      if (!isMounted) return;

      // Handle different auth events
      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          setUser(session?.user ?? null);
          break;
        case "SIGNED_OUT":
          setUser(null);
          break;
        case "INITIAL_SESSION":
          // Only update if we haven't completed initial session check
          if (!sessionCheckComplete) {
            setUser(session?.user ?? null);
            setSessionCheckComplete(true);
          }
          break;
        default:
          setUser(session?.user ?? null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [sessionCheckComplete]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAuthEnabled: isSupabaseEnabled,
    sessionCheckComplete, // Export this for other components to use
  };
};
