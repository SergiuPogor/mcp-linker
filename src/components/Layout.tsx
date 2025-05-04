import { Suspense, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import useAppCategories from "./categories";

import { fetchServers } from "@/lib/api";
import { needspathClient } from "@/lib/data";
import { Pages } from "@/pages-map";
import { Toaster } from "sonner";
import LangSelect from "./LangSelect";
import { PathSelector } from "./PathSelector";
import { Sidebar } from "./Sidebar";
import { ClientSelector } from "./client-selector";

interface ContentAreaProps {
  selectedClient: string;
  selectedPath: string;
  categoryId: string;
}

const ContentArea: React.FC<ContentAreaProps> = ({
  selectedClient,
  selectedPath,
  categoryId,
}) => {
  const [mcpServers, setMcpServers] = useState<{ servers: any[] }>({
    servers: [],
  });

  useEffect(() => {
    fetchServers()
      .then((data) => setMcpServers(data))
      .catch((err) => console.error("Failed to load servers", err));
  }, []);

  const PageComponent = Pages[categoryId] || Pages["other"];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageComponent
        selectedClient={selectedClient}
        selectedPath={selectedPath}
        mcpServers={mcpServers.servers}
      />
    </Suspense>
  );
};

interface DashboardProps {
  selectedClient: string;
  setSelectedClient: (app: string) => void;
  selectedPath: string;
  setSelectedPath: (path: string) => void;
}

// App component
const AppStore = ({
  selectedClient,
  setSelectedClient,
  selectedPath,
  setSelectedPath,
}: DashboardProps) => {
  // Define the app categories and their content
  const appCategories = useAppCategories();

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Sidebar appCategories={appCategories} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between pt-2 px-2">
          <span>
            <ClientSelector
              selectedClient={selectedClient}
              onChange={setSelectedClient}
            />
          </span>

          {needspathClient.includes(selectedClient) && (
            <PathSelector
              selectedPath={selectedPath}
              onChange={setSelectedPath}
            />
          )}
          <LangSelect />
        </div>

        <div className="flex-1 overflow-auto">
          <Routes>
            {appCategories.map((category) => (
              <Route
                key={category.id}
                path={`/${category.id}`}
                element={
                  <ContentArea
                    selectedClient={selectedClient}
                    selectedPath={selectedPath}
                    categoryId={category.id}
                  />
                }
              />
            ))}
            <Route
              path="/recently"
              element={
                <ContentArea
                  selectedClient={selectedClient}
                  selectedPath={selectedPath}
                  categoryId="recently"
                />
              }
            />
            <Route
              path="/"
              element={
                <ContentArea
                  selectedClient={selectedClient}
                  selectedPath={selectedPath}
                  categoryId={appCategories[0].id}
                />
              }
            />
          </Routes>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default AppStore;
