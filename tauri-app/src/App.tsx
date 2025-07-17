import { GlobalDialog } from "@/components/common/GlobalDialog";
import CommandChecker from "@/components/settings/CommandChecker";
import { ThemeProvider } from "@/components/theme-provider";
import { useDeepLink } from "@/hooks/useDeepLink";
import { useGlobalDialogStore } from "@/stores/globalDialogStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Layout from "./components/Layout";

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
  const { open, type, hideDialog } = useGlobalDialogStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <Layout />
        <GlobalDialog open={open} type={type || "login"} onClose={hideDialog} />
      </ThemeProvider>
      <CommandChecker />
    </QueryClientProvider>
  );
}

export default App;
