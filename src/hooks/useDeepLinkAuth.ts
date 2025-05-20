import supabase from "@/utils/supabase";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useDeepLinkAuth = () => {
  const navigate = useNavigate();
  const [isHandlingAuth, setIsHandlingAuth] = useState(false);

  useEffect(() => {
    // Check URL parameters immediately
    const urlObj = new URL(window.location.href);
    const searchParams = new URLSearchParams(urlObj.search);
    const code = searchParams.get("code");

    if (code) {
      setIsHandlingAuth(true);
    }

    const handleUrl = async (urls: string[]) => {
      try {
        setIsHandlingAuth(true);
        const url = urls[0];

        const urlObj = new URL(url);
        const searchParams = new URLSearchParams(urlObj.search.substring(1));

        const code = searchParams.get("code");
        if (code) {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data.session) navigate("/onboarding");
          return;
        }
      } catch (err) {
        console.error("Error handling deep link:", err);
      } finally {
        setIsHandlingAuth(false);
      }
    };

    onOpenUrl(handleUrl);
  }, [navigate]);

  return isHandlingAuth;
};
