import supabase from "@/utils/supabase";
const apiUrl = import.meta.env.VITE_API_URL;

const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('No active Supabase session');
  return data.session;
};

export const handleAuthCallback = async () => getSession();

export const getSupabaseAuthInfo = async () => {
  const session = await getSession();
  return {
    token: session.access_token,
    user: session.user,
  };
};

export const getCurrentUser = async () => {
  try {
    const session = await getSession();
    const res = await fetch(`${apiUrl}/users/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (!res.ok) throw new Error('Failed to fetch user data');
    const userData = await res.json();
    return { ...userData, session };
  } catch (err) {
    console.error('Error getting current user:', err);
    return null;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export default {
  getSession,
  handleAuthCallback,
  getSupabaseAuthInfo,
  getCurrentUser,
  signOut,
};