// src/App.tsx
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import CommandChecker from "@/components/CommandChecker";
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
  const [selectedClient, setSelectedClient] = useState<string>("claude");
  const [selectedPath, setSelectedPath] = useState<string>("");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <CommandChecker />
        <Layout
          selectedClient={selectedClient}
          setSelectedClient={setSelectedClient}
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
