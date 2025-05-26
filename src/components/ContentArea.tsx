import { lazy, Suspense, useEffect, useRef } from "react";
import { ContentLoadingFallback } from "./common/LoadingConfig";

const dynamicPages: {
  [key: string]: React.LazyExoticComponent<React.FC<any>>;
} = {
  home: lazy(() => import("@/views/home")),
  discover: lazy(() => import("@/views/Discover")),
  categories: lazy(() => import("@/views/categories")),
  search: lazy(() => import("@/views/search")),
  manage: lazy(() => import("@/views/manager")),
  favs: lazy(() => import("@/views/favorites")),
  auth: lazy(() => import("@/views/AuthPage")),
  dashboard: lazy(() => import("@/views/Dashboard")),
  onboarding: lazy(() => import("@/views/OnBoarding")),
  recently: lazy(() => import("@/views/recently")),
};

interface ContentAreaProps {
  navId: string;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ navId }) => {
  const PageComponent = dynamicPages[navId] || dynamicPages["home"];
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
