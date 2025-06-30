/*
 this page don't use console in tauri
*/
import { useAuth } from "@/hooks/useAuth";
import { useUnifiedDeepLink } from "@/hooks/useUnifiedDeepLink";
import { getCurrentUser } from "@/services/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Constants for retry configuration
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 5000;
const MAX_RETRIES = 3;

export default function OnBoarding() {
  const navigate = useNavigate();
  const { user, loading, sessionCheckComplete } = useAuth();
  const { isHandlingAuth } = useUnifiedDeepLink();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const hasInitialized = useRef(false);
  const lastRetryTime = useRef<number>(0);
  const [authCheckStarted, setAuthCheckStarted] = useState(false);

  // Calculate adaptive retry delay based on retry count and system time
  const getRetryDelay = useCallback(() => {
    const baseDelay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
      MAX_RETRY_DELAY,
    );
    const timeSinceLastRetry = Date.now() - lastRetryTime.current;
    return Math.max(baseDelay - timeSinceLastRetry, 0);
  }, [retryCount]);

  const authenticateWithRetry = useCallback(async () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error(
        "Authentication failed after multiple attempts. Please sign in again.",
      );
      navigate("/auth");
      return;
    }

    try {
      // If retrying, wait for adaptive delay
      if (retryCount > 0) {
        const delay = getRetryDelay();
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      lastRetryTime.current = Date.now();
      toast.success(
        `Authenticating user... ${retryCount > 0 ? `(Attempt ${retryCount + 1})` : ""}`,
      );

      const userData = await getCurrentUser();

      if (userData) {
        toast.success("User authenticated successfully");
        navigate("/manage");
        return;
      } else {
        throw new Error("No user data received");
      }
    } catch (error: any) {
      // Handle time synchronization issues
      if (error.message?.includes("not yet valid") || error.status === 401) {
        setRetryCount((prev) => prev + 1);
        const nextDelay = getRetryDelay();
        toast.warning(
          `Authentication failed, retrying in ${Math.round(nextDelay / 1000)}s... (${retryCount + 1}/${MAX_RETRIES})`,
        );
        return;
      }

      // Other errors redirect to login page
      toast.error("Authentication failed. Please sign in again.");
      navigate("/auth");
    }
  }, [retryCount, navigate, getRetryDelay]);

  // Main authentication logic - updated to wait for session check completion
  useEffect(() => {
    const initAuth = async () => {
      // Don't proceed if still loading auth state, handling deep link auth, or session check not complete
      if (loading || isHandlingAuth || !sessionCheckComplete) {
        return;
      }

      // If no user, redirect to login (but only if not currently handling auth)
      if (!user) {
        // Add delay to ensure auth state is fully settled, especially on Windows
        const redirectDelay = navigator.platform.toLowerCase().includes("win")
          ? 500
          : 100;
        setTimeout(() => {
          if (!user && !isHandlingAuth) {
            toast.error("No user session found. Please sign in.");
            navigate("/auth");
          }
        }, redirectDelay);
        return;
      }

      // Prevent duplicate initialization
      if (hasInitialized.current || authCheckStarted) return;

      hasInitialized.current = true;
      setAuthCheckStarted(true);

      // If user exists, try to authenticate with backend
      setIsAuthenticating(true);
      try {
        await authenticateWithRetry();
      } finally {
        setIsAuthenticating(false);
      }
    };

    initAuth();
  }, [
    navigate,
    user,
    loading,
    isHandlingAuth,
    sessionCheckComplete,
    authenticateWithRetry,
    authCheckStarted,
  ]);

  // Retry logic - only triggered when retry is needed
  useEffect(() => {
    if (
      retryCount > 0 &&
      retryCount < MAX_RETRIES &&
      user &&
      !loading &&
      !isHandlingAuth &&
      !isAuthenticating &&
      sessionCheckComplete
    ) {
      const timer = setTimeout(async () => {
        setIsAuthenticating(true);
        try {
          await authenticateWithRetry();
        } finally {
          setIsAuthenticating(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    retryCount,
    MAX_RETRIES,
    user,
    loading,
    isHandlingAuth,
    isAuthenticating,
    sessionCheckComplete,
    authenticateWithRetry,
  ]);

  // Show loading while auth state is being determined or deep link auth is in progress
  if (loading || isHandlingAuth || !sessionCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>
            {isHandlingAuth ? "Processing authentication..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Show authenticating state
  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>
            Authenticating...{retryCount > 0 && ` (Attempt ${retryCount + 1})`}
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Retrying due to time sync issues...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to MCP Linker</h1>
        <p>Setting up your account...</p>
      </div>
    </div>
  );
}
