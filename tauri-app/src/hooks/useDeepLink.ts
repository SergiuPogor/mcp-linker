import supabase from "@/utils/supabase";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function debugLog(msg: string) {
  if (import.meta.env.VITE_IS_DEV === "true") {
    alert(msg);
  }
}

const processedUrls = new Set<string>();

// useDeepLink hook: handles deep link authentication and navigation
export const useDeepLink = () => {
  const navigate = useNavigate();
  const [isHandlingDeepLink, setIsHandlingDeepLink] = useState(false);

  useEffect(() => {
    const urlObj = new URL(window.location.href);
    const searchParams = new URLSearchParams(urlObj.search);
    const code = searchParams.get("code");

    if (code) {
      setIsHandlingDeepLink(true);
    }

    const handleUrl = async (urls: string[] | string) => {
      const url = Array.isArray(urls) ? urls[0] : urls;
      try {
        if (processedUrls.has(url)) {
          return;
        }
        debugLog(url);
        processedUrls.add(url);

        setIsHandlingDeepLink(true);
        const urlObj = new URL(url);
        const searchParams = new URLSearchParams(urlObj.search.substring(1));

        if (url.includes("/servers/")) {
          const parts = url.split("/");
          const id = parts[parts.length - 1];
          navigate(`/servers/${id}`, { replace: true });
        }

        const code = searchParams.get("code");
        if (code && supabase) {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session) {
            toast.success("User authenticated successfully");
            navigate("/manage", { replace: true });
            return;
          }
        }
      } catch (err) {
        processedUrls.delete(url);
        toast.error("Authentication failed. Please sign in again.");
        navigate("/auth", { replace: true });
      } finally {
        setIsHandlingDeepLink(false);
      }
    };

    onOpenUrl((urls) => handleUrl(urls));
  }, [navigate]);

  return isHandlingDeepLink;
};
