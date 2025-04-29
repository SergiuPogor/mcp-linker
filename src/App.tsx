// src/App.tsx
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import CommandChecker from "@/components/CommandChecker";
import Layout from "./components/Layout";
import "./App.css";

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
  const [selectedApp, setSelectedApp] = useState<string>("claude");
  const [selectedPath, setSelectedPath] = useState<string>("");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey="vite-ui-theme">
        <CommandChecker />
        <Layout
          selectedApp={selectedApp}
          setSelectedApp={setSelectedApp}
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
