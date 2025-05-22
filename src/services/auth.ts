// services/auth.ts (优化版)
import supabase from "@/utils/supabase";
import { Session } from "@supabase/supabase-js";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Add logging for debugging
console.log("API URL:", apiUrl);

// 基础会话获取（保持现有逻辑）
export const getSession = async (): Promise<Session> => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    console.error("Supabase session error:", error);
    throw new Error("No active Supabase session");
  }
  console.log("Session retrieved successfully:", !!data.session);
  return data.session;
};

// 获取认证信息的通用方法
export const getAuthInfo = async () => {
  const session = await getSession();
  return {
    session,
    token: session.access_token,
    user: session.user,
    authHeader: `Bearer ${session.access_token}`,
  };
};

// 获取当前用户（使用统一的 API 客户端）
export const getCurrentUser = async () => {
  try {
    const { authHeader } = await getAuthInfo();
    const endpoint = `${apiUrl}/users/me`;
    
    console.log("Fetching user from:", endpoint);
    console.log("Auth header present:", !!authHeader);
    
    const res = await fetch(endpoint, {
      headers: { 
        Authorization: authHeader,
        'Content-Type': 'application/json'
      },
    });

    console.log("API Response status:", res.status);
    console.log("API Response ok:", res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error Response:", errorText);
      throw new Error(`Failed to fetch user data: ${res.status} ${res.statusText}`);
    }
    
    const userData = await res.json();
    console.log("User data retrieved:", !!userData);
    return userData;
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
};

// 登出
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// 认证回调处理
export const handleAuthCallback = async () => getSession();

// 导出所有方法
export default {
  getSession,
  getAuthInfo,
  getCurrentUser,
  signOut,
  handleAuthCallback,
};