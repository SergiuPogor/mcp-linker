// src/App.tsx
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { checkForUpdate } from "./lib/update";

import { useDeepLinkAuth } from '@/hooks/useDeepLinkAuth';
import "./App.css";
const Layout = lazy(() => import("./components/Layout"));
const CommandChecker = lazy(() => import("@/components/CommandChecker"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useDeepLinkAuth();

  useEffect(() => {
    checkForUpdate()
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
      <Suspense fallback={<div>Loading...</div>}>
          <CommandChecker />
          <Layout />
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;