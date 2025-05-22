// src/hooks/useUnifiedDeepLink.ts
import supabase from "@/utils/supabase";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

let pendingDeepLink: string | null = null;
let trigger: (() => void) | null = null;
let isInitialized = false; // Track initialization state

export const useUnifiedDeepLink = () => {
  const navigate = useNavigate();
  const [isHandlingAuth, setIsHandlingAuth] = useState(false);

  // Actually perform navigation
  const handleDeepLink = async (urlString: string) => {
    try {
      console.log(`Received deep link: ${urlString}`);
      const url = new URL(urlString);
      const code = new URLSearchParams(url.search).get("code");

      if (code) {
        setIsHandlingAuth(true);
        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        if (data.session) {
          toast.info("nav to /onboarding")
          navigate("/onboarding");
        }
      } else if (url.hostname === "servers" && url.pathname.length > 1) {
        const id = url.pathname.slice(1);
        console.log(`Navigating to server ID from deep link: ${id}`);
        // Use a direct navigate with pathname to ensure it doesn't get mixed up with other navigation
        navigate(`/servers/${id}`, { replace: true });
      }
    } catch (err) {
      console.error("Error handling deep link:", err);
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
        console.log("Triggering deep link handler");
        trigger();
      } else {
        console.log("Trigger not ready yet");
      }
    };

    onOpenUrl((urls) => {
      console.log(`Received URLs: ${urls.join(", ")}`);
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
        console.log(`Handling pending deep link: ${pendingDeepLink}`);
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
