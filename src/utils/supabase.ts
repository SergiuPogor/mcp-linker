import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase configuration is available
export const isSupabaseEnabled = !!(supabaseUrl && supabaseKey);

let supabase: SupabaseClient | null = null;

if (isSupabaseEnabled) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.warn("Failed to initialize Supabase client:", error);
    supabase = null;
  }
} else {
  console.info("Supabase not configured - authentication features will be disabled");
}

export default supabase;
