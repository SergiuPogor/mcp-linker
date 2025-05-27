import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useState } from "react";
import { checkForUpdate, UpdateInfo } from "./lib/update";

import { useUnifiedDeepLink } from "@/hooks/useUnifiedDeepLink";
import "./App.css";
import { AppLoadingFallback } from "./components/common/LoadingConfig";
import { StoreInitializer } from "./components/StoreInitializer";
import { TriggerOnMount } from "./components/TriggerOnMount";
import { UpdateDialog } from "./components/UpdateDialog";
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
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  useEffect(() => {
    const handleCheckForUpdate = async () => {
      if (import.meta.env.VITE_IS_CHECK_UPDATE === "true") {
        const update = await checkForUpdate();
        if (update?.hasUpdate) {
          setUpdateInfo(update);
          setShowUpdateDialog(true);
        }
      }
    };

    handleCheckForUpdate();
  }, []);

  const handleCloseUpdateDialog = () => {
    setShowUpdateDialog(false);
    setUpdateInfo(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <Suspense fallback={<AppLoadingFallback />}>
          <StoreInitializer />
          <CommandChecker />
          {/* deep link */}
          <TriggerOnMount onReady={triggerPendingDeepLink} />

          <Layout />

          {/* Update dialog */}
          {updateInfo && (
            <UpdateDialog
              isOpen={showUpdateDialog}
              onClose={handleCloseUpdateDialog}
              latestVersion={updateInfo.latestVersion}
              releaseNotes={updateInfo.releaseNotes}
              releaseUrl={updateInfo.releaseUrl}
            />
          )}
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
