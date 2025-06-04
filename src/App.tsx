import CommandChecker from "@/components/CommandChecker";
import { ThemeProvider } from "@/components/theme-provider";
import { useUnifiedDeepLink } from "@/hooks/useUnifiedDeepLink";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import { TriggerOnMount } from "./components/TriggerOnMount";
import { UpdateDialog } from "./components/UpdateDialog";
import { checkForUpdate, UpdateInfo } from "./lib/update";

declare global {
  interface Window {
    __TAURI__?: any;
  }
}

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
  const isTauri = typeof window.__TAURI__ !== "undefined";

  useEffect(() => {
    if (import.meta.env.VITE_IS_CHECK_UPDATE === "true") {
      checkForUpdate().then((update) => {
        if (update?.hasUpdate) {
          setUpdateInfo(update);
        }
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        {isTauri && <CommandChecker />}
        <TriggerOnMount onReady={triggerPendingDeepLink} />
        <Layout />

        {updateInfo && (
          <UpdateDialog
            isOpen={true}
            onClose={() => setUpdateInfo(null)}
            latestVersion={updateInfo.latestVersion}
            releaseNotes={updateInfo.releaseNotes}
            releaseUrl={updateInfo.releaseUrl}
          />
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
