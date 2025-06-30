import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router";
import { ContentLoadingFallback } from "./common/LoadingConfig";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { user, loading, isAuthEnabled } = useAuth();
  const location = useLocation();

  // If auth is disabled, allow all access
  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  // Show loading only when actually checking auth
  if (loading) {
    return <ContentLoadingFallback />;
  }

  // If auth is required and user is not authenticated, redirect to auth page
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If auth is not required and user is authenticated, don't redirect
  // Allow users to access public pages even when logged in
  return <>{children}</>;
};
