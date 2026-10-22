import { CollectionPage } from "@/pages/CollectionPage";
import Discover from "@/pages/Discover";
import Manage from "@/pages/manage";
import NotesPage from "@/pages/NotesPage";
import PluginsPage from "@/pages/PluginsPage";
import { NewServerPage } from "@/pages/NewServerPage";
import { ServerPage } from "@/pages/ServerPage";
import SettingsPage from "@/pages/SettingsPage";
import {
  LayoutDashboard,
  NotebookPen,
  Puzzle,
  FileInput,
  Search,
} from "lucide-react";
import About from "./pages/About";
import { InstallAppPage } from "./pages/InstallApp";
import { useViewStore } from "./stores/viewStore";

export const AppRoutes = () => {
  const { view, params } = useViewStore();

  switch (view) {
    case "discover":
      return <Discover />;
    case "manage":
      return <Manage />;
    case "plugins":
      return <PluginsPage />;
    case "recently":
      return <Manage />;
    case "settings":
      return <SettingsPage />;
    case "about":
      return <About />;
    case "server":
      return params.id === "new" ? <NewServerPage /> : <ServerPage />;
    case "install-app":
      return <InstallAppPage />;
    case "notes":
      return <NotesPage />;
    case "favorites":
      return <Discover />;
    case "collection":
      return <CollectionPage />;
    default:
      return <Discover />;
  }
};

// Route configuration for navigation
export const getNavigationRoutes = (
  t: (key: string, options?: any) => string,
) => {
  return [
    {
      id: "discover",
      name: t("nav.discover"),
      icon: <Search />,
    },
    {
      id: "manage",
      name: t("nav.manage"),
      icon: <LayoutDashboard />,
    },
    {
      id: "notes",
      name: "Notes",
      icon: <NotebookPen />,
    },
    {
      id: "plugins",
      name: t("nav.plugins"),
      icon: <Puzzle />,
    },
    {
      id: "install-app",
      name: "Import Configuration",
      icon: <FileInput />,
    },
  ];
};
