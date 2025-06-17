// services/auth.ts (optimized version)
import { apiUrl } from "@/lib/apiClient";
import supabase, { isSupabaseEnabled, resetSupabaseClient } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";

// Add logging for debugging
console.log("Supabase enabled:", isSupabaseEnabled);

// Basic session retrieval with retry mechanism for Windows
export const getSession = async (): Promise<Session | null> => {
  console.log("getSession called. Supabase enabled:", isSupabaseEnabled);
  if (!isSupabaseEnabled || !supabase) {
    console.debug("Supabase is not configured or disabled");
    return null;
  }

  // Retry mechanism for Windows timing issues
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        lastError = error;
        console.debug(
          `Session retrieval attempt ${attempt + 1} failed:`,
          error.message,
        );

        // Wait before retry (except for last attempt)
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, 200 * (attempt + 1)),
          );
          continue;
        }
      }

      if (!data.session) {
        console.debug(
          "No active Supabase session:",
          error?.message || "No session",
          "Current session data:", data.session
        );
        return null;
      }

      console.log("Session retrieved successfully:", !!data.session, "User ID:", data.session?.user?.id, "User email:", data.session?.user?.email);
      return data.session;
    } catch (err) {
      lastError = err;
      console.debug(`Session retrieval attempt ${attempt + 1} failed:`, err);

      // Wait before retry (except for last attempt)
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 200 * (attempt + 1)),
        );
      }
    }
  }

  console.error("Failed to retrieve session after all retries:", lastError);
  return null;
};

// Get authentication information
export const getAuthInfo = async () => {
  const session = await getSession();
  if (!session) {
    throw new Error("No active session");
  }

  return {
    user: session.user,
    authHeader: `Bearer ${session.access_token}`,
  };
};

// Get current user (using unified API client) with enhanced error handling
export const getCurrentUser = async () => {
  try {
    if (!isSupabaseEnabled) {
      console.log("Authentication disabled - returning mock user");
      return null;
    }

    const { authHeader } = await getAuthInfo();
    const endpoint = `${apiUrl}/users/me`;

    console.log("Fetching user from:", endpoint);
    console.log("Auth header present:", !!authHeader);

    // Enhanced fetch with timeout and retry logic
    const fetchWithTimeout = async (
      url: string,
      options: RequestInit,
      timeout = 10000,
    ) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    const res = await fetchWithTimeout(endpoint, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    console.log("API Response status:", res.status);
    console.log("API Response ok:", res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error Response:", errorText);

      // Enhanced error handling for different status codes
      if (res.status === 401) {
        throw new Error(
          `Authentication failed: ${res.status} ${res.statusText}`,
        );
      } else if (res.status >= 500) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      } else {
        throw new Error(
          `Failed to fetch user data: ${res.status} ${res.statusText}`,
        );
      }
    }

    const userData = await res.json();
    console.log("User data retrieved:", !!userData);
    return userData;
  } catch (err) {
    console.error("Error getting current user:", err);

    // Re-throw with more specific error information
    if (err instanceof Error) {
      if (
        err.message.includes("Authentication failed") ||
        err.message.includes("No active session")
      ) {
        throw err; // Re-throw auth errors as-is
      } else if (err.name === "AbortError") {
        throw new Error(
          "Request timeout - please check your network connection",
        );
      } else if (err.message.includes("Failed to fetch")) {
        throw new Error("Network error - please check your connection");
      }
    }

    throw new Error("Unknown error occurred during authentication");
  }
};

// Sign out
export const signOut = async () => {
  if (!supabase || !isSupabaseEnabled) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // Explicitly clear all Supabase related items from localStorage
  // This is a safeguard if supabase.auth.signOut() doesn't fully clear them in all scenarios.
  for (const key in localStorage) {
    if (key.startsWith("sb-")) {
      localStorage.removeItem(key);
    }
  }

  // Explicitly reset the Supabase client instance to ensure a clean state
  resetSupabaseClient();

  // Force a full page reload to clear all client-side state and ensure fresh session
  window.location.reload(); // Re-enabled to ensure a full client-side state reset
};

// Handle authentication callback
export const handleAuthCallback = async () => {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error("Supabase is not configured");
  }
  return getSession();
};

// Export all methods
export default {
  getSession,
  getAuthInfo,
  getCurrentUser,
  signOut,
  handleAuthCallback,
};
