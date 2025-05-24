// services/auth.ts (optimized version)
import supabase, { isSupabaseEnabled } from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Add logging for debugging
console.log("API URL:", apiUrl);
console.log("Supabase enabled:", isSupabaseEnabled);

// Basic session retrieval
export const getSession = async (): Promise<Session> => {
  if (!isSupabaseEnabled || !supabase) {
    throw new Error("Supabase is not configured");
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    console.error("Supabase session error:", error);
    throw new Error("No active Supabase session");
  }
  console.log("Session retrieved successfully:", !!data.session);
  return data.session;
};

// Get authentication information
export const getAuthInfo = async () => {
  const session = await getSession();
  return {
    session,
    token: session.access_token,
    user: session.user,
    authHeader: `Bearer ${session.access_token}`,
  };
};

// Get current user (using unified API client)
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

    const res = await fetch(endpoint, {
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
      throw new Error(
        `Failed to fetch user data: ${res.status} ${res.statusText}`,
      );
    }

    const userData = await res.json();
    console.log("User data retrieved:", !!userData);
    return userData;
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
};

// Sign out
export const signOut = async () => {
  if (!isSupabaseEnabled || !supabase) {
    console.log("Authentication disabled - skipping sign out");
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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
