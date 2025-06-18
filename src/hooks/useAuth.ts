import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to prevent race conditions
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("useAuth useEffect triggered");

    // If Supabase is not enabled, allow access without auth
    if (!isSupabaseEnabled || !supabase) {
      console.log("Supabase not enabled in useAuth");
      setUser(null);
      setLoading(false);
      setSessionCheckComplete(true);
      return;
    }

    let isMounted = true; // Prevent state updates after unmount

    // Get initial session with retry mechanism for Windows timing issues
    const getInitialSession = async () => {
      console.log("Attempting to get initial session...");
      try {
        if (!supabase) {
          throw new Error("Supabase client is not initialized");
        }
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!isMounted) {
          console.log("useAuth unmounted during getInitialSession");
          return;
        }

        if (error) {
          console.error("Error getting session:", error);
          setUser(null);
        } else {
          console.log("Initial session retrieved:", !!session?.user);
          setUser(session?.user ?? null);
        }

        setLoading(false);
        setSessionCheckComplete(true);
        console.log("Initial session check complete. User:", !!session?.user);
      } catch (error) {
        console.error("Error in getInitialSession catch block:", error);
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
      console.log(
        "Auth state change:",
        event,
        "Session:",
        session,
        "User email:",
        session?.user?.email,
      );

      if (!isMounted) {
        console.log("useAuth unmounted during auth state change");
        return;
      }

      // Handle different auth events
      switch (event) {
        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          setUser(session?.user ?? null);
          console.log(
            "Auth state changed to SIGNED_IN/TOKEN_REFRESHED. User:",
            !!session?.user,
          );
          // Navigate to onboarding after successful sign in
          if (event === "SIGNED_IN") {
            navigate("/onboarding", { replace: true });
          }
          break;
        case "SIGNED_OUT":
          setUser(null);
          console.log("Auth state changed to SIGNED_OUT. User: null");
          // Reset sessionCheckComplete to false to ensure initial session is re-evaluated on next load/login
          setSessionCheckComplete(false);
          navigate("/auth", { replace: true });
          break;
        case "INITIAL_SESSION":
          // Only update if we haven't completed initial session check
          if (!sessionCheckComplete) {
            setUser(session?.user ?? null);
            setSessionCheckComplete(true);
            console.log(
              "Auth state changed to INITIAL_SESSION. Session check complete.",
            );
          }
          break;
        default:
          setUser(session?.user ?? null);
          console.log("Auth state changed (default). User:", !!session?.user);
      }

      setLoading(false);
    });

    return () => {
      console.log("useAuth useEffect cleanup");
      isMounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [sessionCheckComplete, navigate]);

  console.log(
    "useAuth current return values: loading",
    loading,
    "sessionCheckComplete",
    sessionCheckComplete,
    "isAuthenticated",
    !!user,
  );

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAuthEnabled: isSupabaseEnabled,
    sessionCheckComplete, // Export this for other components to use
  };
};
