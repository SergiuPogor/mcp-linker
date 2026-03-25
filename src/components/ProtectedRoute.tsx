import { useAuth } from "@/hooks/useAuth";
import { useViewStore } from "@/stores/viewStore";
import { useEffect } from "react";
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
  const { navigate } = useViewStore();

  useEffect(() => {
    if (!loading && isAuthEnabled && requireAuth && !user) {
      navigate("/auth", { replace: true });
    }
  }, [loading, isAuthEnabled, requireAuth, user, navigate]);

  if (!isAuthEnabled) return <>{children}</>;
  if (loading || (requireAuth && !user)) return <ContentLoadingFallback />;
  return <>{children}</>;
};
