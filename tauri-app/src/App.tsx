import { GlobalDialog } from "@/components/common/GlobalDialog";
import CommandChecker from "@/components/settings/CommandChecker";
import { ConsentDialog } from "@/components/settings/consent";
import { ThemeProvider } from "@/components/theme-provider";
import { useDeepLink } from "@/hooks/useDeepLink";
import { useGlobalDialogStore } from "@/stores/globalDialogStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import "./App.css";
import Layout from "./components/Layout";
import { UpdateDialog } from "./components/UpdateDialog";
import { checkForUpdate, UpdateInfo } from "./lib/update";

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
  useDeepLink();
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const { open, type, hideDialog } = useGlobalDialogStore();

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
        <Layout />
        <GlobalDialog open={open} type={type || "login"} onClose={hideDialog} />
        {updateInfo && (
          <UpdateDialog
            isOpen={true}
            onClose={() => setUpdateInfo(null)}
            latestVersion={updateInfo.latestVersion}
            releaseNotes={updateInfo.releaseNotes}
            releaseUrl={updateInfo.releaseUrl}
          />
        )}
        <ConsentDialog />
      </ThemeProvider>
      <CommandChecker />
    </QueryClientProvider>
  );
}

export default App;
