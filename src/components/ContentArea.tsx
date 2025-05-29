import { lazy, Suspense, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ContentLoadingFallback } from "./common/LoadingConfig";

const dynamicPages: {
  [key: string]: React.LazyExoticComponent<React.FC<any>>;
} = {
  discover: lazy(() => import("@/views/Discover")),
  activate: lazy(() => import("@/views/UnlockPage")),
  categories: lazy(() => import("@/views/categories")),
  search: lazy(() => import("@/views/search")),
  manage: lazy(() => import("@/views/manager")),
  favorites: lazy(() => import("@/views/favorites")),
  auth: lazy(() => import("@/views/AuthPage")),
  dashboard: lazy(() => import("@/views/Dashboard")),
  onboarding: lazy(() => import("@/views/OnBoarding")),
  recently: lazy(() => import("@/views/recently")),
};

interface ContentAreaProps {
  navId: string;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ navId }) => {
  const location = useLocation();
  const PageComponent = dynamicPages[navId] || dynamicPages["discover"];
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Handle navigation state
  useEffect(() => {
    // If we're at the root path and navId is discover, ensure we're showing the discover page
    if (location.pathname === "/" && navId === "discover") {
      const savedScrollY = sessionStorage.getItem(`scroll-${navId}`);
      if (scrollRef.current && savedScrollY) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = parseInt(savedScrollY, 10);
            }
          }, 300);
        });
      }
    }
  }, [location.pathname, navId]);

  // Save scroll position when unmounting
  useEffect(() => {
    return () => {
      if (scrollRef.current) {
        sessionStorage.setItem(
          `scroll-${navId}`,
          scrollRef.current.scrollTop.toString(),
        );
      }
    };
  }, [navId]);

  return (
    <div className="flex-1 overflow-auto" ref={scrollRef}>
      <Suspense fallback={<ContentLoadingFallback />}>
        <PageComponent />
      </Suspense>
    </div>
  );
};
