// src/hooks/useUnifiedDeepLink.ts
import supabase from "@/utils/supabase";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

let pendingDeepLink: string | null = null;
let trigger: (() => void) | null = null;
let isInitialized = false;

export const useUnifiedDeepLink = () => {
  const navigate = useNavigate();
  const [isHandlingAuth, setIsHandlingAuth] = useState(false);

  // Enhanced deep link handler with better Windows compatibility
  const handleDeepLink = async (urlString: string) => {
    try {
      console.log(`Received deep link: ${urlString}`);
      const url = new URL(urlString);
      const code = new URLSearchParams(url.search).get("code");

      if (code) {
        setIsHandlingAuth(true);

        if (!supabase) {
          throw new Error("Supabase client is not initialized");
        }

        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) throw error;

        if (data.session) {
          // Enhanced waiting mechanism for auth state synchronization
          await new Promise<void>((resolve) => {
            if (!supabase) {
              throw new Error("Supabase client is not initialized");
            }
            let resolved = false;

            // Primary: Wait for auth state change
            const unsubscribe = supabase.auth.onAuthStateChange(
              (event, session) => {
                if (
                  !resolved &&
                  session?.user &&
                  (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
                ) {
                  resolved = true;
                  unsubscribe.data.subscription.unsubscribe();
                  resolve();
                }
              },
            );

            // Secondary: Wait for session to be available via getSession
            const checkSession = async () => {
              try {
                if (!supabase) {
                  throw new Error("Supabase client is not initialized");
                }
                const { data: sessionData } = await supabase.auth.getSession();
                if (!resolved && sessionData.session?.user) {
                  resolved = true;
                  unsubscribe.data.subscription.unsubscribe();
                  resolve();
                }
              } catch (err) {
                console.warn("Session check failed:", err);
              }
            };

            // Check session immediately and then periodically
            checkSession();
            const sessionCheckInterval = setInterval(checkSession, 250);

            // Platform-specific timeout (Windows needs more time)
            const timeoutDuration = navigator.platform
              .toLowerCase()
              .includes("win")
              ? 3000
              : 2000;
            const fallbackTimeout = setTimeout(() => {
              if (!resolved) {
                resolved = true;
                clearInterval(sessionCheckInterval);
                unsubscribe.data.subscription.unsubscribe();
                console.warn("Auth state sync timeout, proceeding anyway");
                resolve();
              }
            }, timeoutDuration);

            // Cleanup when resolved
            const originalResolve = resolve;
            resolve = () => {
              clearInterval(sessionCheckInterval);
              clearTimeout(fallbackTimeout);
              originalResolve();
            };
          });

          // Add small delay before navigation to ensure UI state is updated
          await new Promise((resolve) => setTimeout(resolve, 100));

          toast.info("nav to /onboarding");
          navigate("/onboarding", { replace: true });
        }
      } else if (url.hostname === "servers" && url.pathname.length > 1) {
        const id = url.pathname.slice(1);
        navigate(`/servers/${id}`, { replace: true });
      }
    } catch (err) {
      console.error("Deep link handling error:", err);
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsHandlingAuth(false);
    }
  };

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized) return;
    isInitialized = true;

    console.log("Setting up deep link listener");

    const process = async (url: string) => {
      console.log(`Processing URL: ${url}`);
      pendingDeepLink = url;
      if (trigger) {
        trigger();
      }
    };

    onOpenUrl((urls) => {
      if (urls.length > 0) process(urls[0]);
    });

    const currentUrl = new URL(window.location.href);
    const code = new URLSearchParams(currentUrl.search).get("code");
    if (code) {
      pendingDeepLink = currentUrl.href;
    }

    // Set up trigger
    trigger = () => {
      if (pendingDeepLink) {
        handleDeepLink(pendingDeepLink);
        pendingDeepLink = null;
      }
    };
  }, [navigate]);

  const manualTriggerDeepLink = (url: string) => {
    pendingDeepLink = url;
    if (trigger) {
      trigger();
    }
  };

  return {
    isHandlingAuth,
    triggerPendingDeepLink: () => trigger?.(),
    manualTriggerDeepLink,
  };
};
