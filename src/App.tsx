import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { checkForUpdate } from "./lib/update";

import { useUnifiedDeepLink } from "@/hooks/useUnifiedDeepLink";
import "./App.css";
import { TriggerOnMount } from "./components/TriggerOnMount";
import { AppLoadingFallback } from "./components/LoadingConfig";
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
  const { triggerPendingDeepLink } = useUnifiedDeepLink();

  useEffect(() => {
    checkForUpdate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <Suspense fallback={<AppLoadingFallback />}>
          <CommandChecker />
          <Layout />
          {/* deep link */}
          <TriggerOnMount onReady={triggerPendingDeepLink} />
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
export default App;
