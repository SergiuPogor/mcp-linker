import { useAuth } from "@/hooks/useAuth";
import { useViewStore } from "@/stores/viewStore";
import { useEffect } from "react";
import { ContentLoadingFallback } from "./common/LoadingConfig";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

function RedirectToAuth() {
  const { navigate } = useViewStore();
  useEffect(() => {
    navigate("/auth", { replace: true });
  }, []);
  return <ContentLoadingFallback />;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
}) => {
  const { user, loading, isAuthEnabled } = useAuth();

  if (!isAuthEnabled) {
    return <>{children}</>;
  }

  if (loading) {
    return <ContentLoadingFallback />;
  }

  if (requireAuth && !user) {
    return <RedirectToAuth />;
  }

  return <>{children}</>;
};
