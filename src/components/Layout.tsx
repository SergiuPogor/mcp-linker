import { lazy, Suspense, useEffect, useRef } from "react";
import { Route, Routes } from "react-router-dom";

import useNav from "./nav";

import { needspathClient } from "@/lib/data";
import { useClientPathStore } from "@/store/clientPathStore";
import { Toaster } from "sonner";
import LangSelect from "./LangSelect";
import { PathSelector } from "./PathSelector";
import { Sidebar } from "./Sidebar";

import { ClientSelector } from "./client-selector";

const fallbackComponent = () => <div>Loading...</div>;

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
  onboarding: lazy(() => import("@/views/OnBoardingPage")),
  recently: lazy(() => import("@/views/recently")),
};

interface ContentAreaProps {
  navId: string;
}

const ContentArea: React.FC<ContentAreaProps> = ({ navId }) => {
  const PageComponent = dynamicPages[navId] || dynamicPages["other"];
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedScrollY = sessionStorage.getItem(`scroll-${navId}`);
    if (scrollRef.current && savedScrollY) {
      // Use requestAnimationFrame + setTimeout to delay setting scrollTop
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = parseInt(savedScrollY, 10);
          }
        }, 300); // Delay to ensure content rendering is complete
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
      <Suspense fallback={fallbackComponent()}>
        <PageComponent />
      </Suspense>
    </div>
  );
};

const MCPStore = () => {
  const { selectedClient } = useClientPathStore();
  const navs = useNav();

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      {/* Sidebar fixed width to prevent scroll interference */}
      <div className="flex-shrink-0 h-full">
        <Sidebar navs={navs} />
      </div>

      {/* Main content scrolls independently */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between pt-2 px-2 shrink-0">
          <span>
            <ClientSelector />
          </span>
          {needspathClient.includes(selectedClient) && <PathSelector />}
          <LangSelect />
        </div>
        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto">
          <Routes>
            {navs.map((nav) => (
              <Route
                key={nav.id}
                path={`/${nav.id}`}
                element={<ContentArea navId={nav.id} />}
              />
            ))}
            <Route
              path="/recently"
              element={<ContentArea navId="recently" />}
            />

            <Route path="/search" element={<ContentArea navId="search" />} />
            <Route path="/auth" element={<ContentArea navId="auth" />} />
            <Route path="/onboarding" element={<ContentArea navId="onboarding" />} />
            <Route path="/" element={<ContentArea navId={navs[0].id} />} />
          </Routes>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
};

export default MCPStore;