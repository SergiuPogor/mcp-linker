import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser } from "@/services/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function OnBoarding() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Use ref to prevent duplicate authentication
  const hasInitialized = useRef(false);

  const authenticateWithRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      toast.error(
        "Authentication failed after multiple attempts. Please sign in again.",
      );
      navigate("/login");
      return;
    }

    try {
      // If retrying, wait for a short time
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }

      toast.success(
        `Authenticating user... ${retryCount > 0 ? `(Attempt ${retryCount + 1})` : ""}`,
      );
      const userData = await getCurrentUser();

      if (userData) {
        toast.success("User authenticated successfully");
        navigate("/dashboard");
        return;
      } else {
        throw new Error("No user data received");
      }
    } catch (error: any) {
      console.error(`Authentication error (attempt ${retryCount + 1}):`, error);

      // If JWT time issue, retry automatically
      if (error.message?.includes("not yet valid") || error.status === 401) {
        setRetryCount((prev) => prev + 1);
        toast.warning(
          `Authentication failed, retrying... (${retryCount + 1}/${maxRetries})`,
        );
        return;
      }

      // Other errors redirect to login page
      toast.error("Authentication failed. Please sign in again.");
      navigate("/login");
    }
  }, [retryCount, maxRetries, navigate]);

  // Main authentication logic - removed isAuthenticating dependency
  useEffect(() => {
    const initAuth = async () => {
      // Don't proceed if still loading auth state
      if (loading) return;

      // If no user, redirect to login
      if (!user) {
        toast.error("No user session found. Please sign in.");
        navigate("/login");
        return;
      }

      // Prevent duplicate initialization
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      // If user exists, try to authenticate with backend
      setIsAuthenticating(true);
      try {
        await authenticateWithRetry();
      } finally {
        setIsAuthenticating(false);
      }
    };

    initAuth();
  }, [navigate, user, loading, authenticateWithRetry]); // Removed isAuthenticating

  // Retry logic - only triggered when retry is needed
  useEffect(() => {
    if (
      retryCount > 0 &&
      retryCount < maxRetries &&
      user &&
      !loading &&
      !isAuthenticating
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
    maxRetries,
    user,
    loading,
    isAuthenticating,
    authenticateWithRetry,
  ]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
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
