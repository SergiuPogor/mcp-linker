import { Route, Routes } from "react-router-dom";

import { needspathClient } from "@/lib/data";
import { useClientPathStore } from "@/store/clientPathStore";
import { ServerPage } from "@/views/ServerPage";
import { Toaster } from "sonner";
import { ContentArea } from "./ContentArea";
import LangSelect from "./LangSelect";
import { PathSelector } from "./PathSelector";
import { Sidebar } from "./Sidebar";
import { ClientSelector } from "./client-selector";
import useNav from "./nav";

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
            <Route path="/servers/:id" element={<ServerPage />} />
            <Route
              path="/dashboard"
              element={<ContentArea navId="dashboard" />}
            />
            <Route path="/" element={<ContentArea navId="discover" />} />
          </Routes>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
};

export default MCPStore;
