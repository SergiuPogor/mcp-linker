import { useAuth } from "@/hooks/useAuth";

export const AuthDebug = () => {
  const { user, loading, isAuthenticated, isAuthEnabled } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div>Auth Enabled: {isAuthEnabled ? "Yes" : "No"}</div>
      <div>Loading: {loading ? "Yes" : "No"}</div>
      <div>Authenticated: {isAuthenticated ? "Yes" : "No"}</div>
      <div>User ID: {user?.id || "None"}</div>
      <div>User Email: {user?.email || "None"}</div>
    </div>
  );
};
