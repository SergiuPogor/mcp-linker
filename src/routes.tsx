import { CollectionPage } from "@/pages/CollectionPage";
import Discover from "@/pages/Discover";
import Manage from "@/pages/manage";
import NotesPage from "@/pages/NotesPage";
import PluginsPage from "@/pages/PluginsPage";
import SkillsPage from "@/pages/SkillsPage";
import { NewServerPage } from "@/pages/NewServerPage";
import { ServerPage } from "@/pages/ServerPage";
import SettingsPage from "@/pages/SettingsPage";
import {
  Home,
  NotebookPen,
} from "lucide-react";
import About from "./pages/About";
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
    case "skills":
      return <SkillsPage />;
    case "recently":
      return <Manage />;
    case "settings":
      return <SettingsPage />;
    case "about":
      return <About />;
    case "server":
      return params.id === "new" ? <NewServerPage /> : <ServerPage />;
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
      name: t("nav.home"),
      icon: <Home />,
    },
    {
      id: "notes",
      name: t("notes.title"),
      icon: <NotebookPen />,
    },
  ];
};
