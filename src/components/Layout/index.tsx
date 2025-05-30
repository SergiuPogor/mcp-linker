import { needspathClient } from "@/lib/data";
import { useClientPathStore } from "@/stores/clientPathStore";
import { ServerPage } from "@/views/ServerPage";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { ContentArea } from "../ContentArea";
import { ProtectedRoute } from "../ProtectedRoute";
import { ClientSelector } from "../settings/client-selector";
import LangSelect from "../settings/LangSelect";
import { PathSelector } from "../settings/PathSelector";
import useNav from "./nav";
import { Sidebar } from "./Sidebar";

const routes = [
  { path: "/", navId: "discover", auth: false },
  { path: "/search", navId: "search", auth: false },
  { path: "/recently", navId: "recently", auth: false },
  { path: "/manage", navId: "manage", auth: false },
  { path: "/categories", navId: "categories", auth: false },
  { path: "/activate", navId: "activate", auth: false },
  { path: "/auth", navId: "auth", auth: false },
  { path: "/onboarding", navId: "onboarding", auth: true },
  { path: "/favorites", navId: "favorites", auth: true },
  { path: "/dashboard", navId: "dashboard", auth: true },
];

const MCPStore = () => {
  const { selectedClient } = useClientPathStore();
  const navs = useNav();

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      <div className="flex-shrink-0 h-full">
        <Sidebar navs={navs} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between pt-2 px-2 shrink-0">
          <span>
            <ClientSelector />
          </span>
          {needspathClient.includes(selectedClient) && <PathSelector />}
          <LangSelect />
        </div>

        <div className="flex-1 overflow-auto">
          <Routes>
            {routes.map(({ path, navId, auth }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute requireAuth={auth}>
                    <ContentArea navId={navId} />
                  </ProtectedRoute>
                }
              />
            ))}
            <Route
              path="/servers/:id"
              element={
                <ProtectedRoute>
                  <ServerPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
};

export default MCPStore;
