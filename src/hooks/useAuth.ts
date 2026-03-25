import { useViewStore } from "@/stores/viewStore";
import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);
  const sessionChecked = useRef(false);
  const { navigate } = useViewStore();

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      setUser(null);
      setLoading(false);
      setSessionCheckComplete(true);
      sessionChecked.current = true;
      return;
    }

    let isMounted = true;

    const markSessionComplete = (user: User | null) => {
      setUser(user);
      setLoading(false);
      setSessionCheckComplete(true);
      sessionChecked.current = true;
    };

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase!.auth.getSession();
        if (!isMounted) return;
        markSessionComplete(error ? null : (session?.user ?? null));
      } catch {
        if (isMounted) markSessionComplete(null);
      }
    };

    // Small delay on Windows to ensure the webview auth store is ready
    const initDelay = navigator.platform.toLowerCase().includes("win") ? 100 : 0;
    const timer = setTimeout(getInitialSession, initDelay);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      switch (event) {
        case "INITIAL_SESSION":
          if (!sessionChecked.current) {
            markSessionComplete(session?.user ?? null);
          }
          break;
        case "SIGNED_IN":
          setUser(session?.user ?? null);
          setLoading(false);
          navigate("/manage", { replace: true });
          break;
        case "TOKEN_REFRESHED":
          setUser(session?.user ?? null);
          setLoading(false);
          break;
        case "SIGNED_OUT":
          setUser(null);
          setLoading(false);
          navigate("/auth", { replace: true });
          break;
        default:
          setUser(session?.user ?? null);
          setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- navigate is stable (zustand)

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAuthEnabled: isSupabaseEnabled,
    sessionCheckComplete,
  };
};
