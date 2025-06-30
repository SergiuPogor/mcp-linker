import { needspathClient } from "@/lib/data";
import { AppRoutes, getNavigationRoutes } from "@/routes";
import { useClientPathStore } from "@/stores/clientPathStore";
import { useTranslation } from "react-i18next";
import { Toaster } from "sonner";
import { ClientSelector } from "../settings/client-selector";
import LangSelect from "../settings/LangSelect";
import { PathSelector } from "../settings/PathSelector";
import { Sidebar } from "./Sidebar";

const Layout = () => {
  const { selectedClient } = useClientPathStore();
  const { t } = useTranslation();

  // Get navigation routes with icons
  const navs = getNavigationRoutes(t as (key: string, options?: any) => string);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
      <Sidebar navs={navs} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Controls */}
        <div className="flex justify-between pt-2 px-2 shrink-0 items-center">
          <ClientSelector />
          {needspathClient.includes(selectedClient) && <PathSelector />}
          <LangSelect />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <AppRoutes />
        </div>
      </div>

      <Toaster position="top-center" richColors />
    </div>
  );
};

export default Layout;
