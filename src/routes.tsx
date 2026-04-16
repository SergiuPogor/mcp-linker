import AuthPage from "@/pages/AuthPage";
import ClaudeCodeManage from "@/pages/ClaudeCodeManage";
import Dashboard from "@/pages/Dashboard";
import Discover from "@/pages/Discover";
import Favorites from "@/pages/favorites";
import Manage from "@/pages/manage";
import NotesPage from "@/pages/NotesPage";
import OnBoarding from "@/pages/OnBoarding";
import Recently from "@/pages/recently";
import { ServerPage } from "@/pages/ServerPage";
import SettingsPage from "@/pages/SettingsPage";
import {
  Clock,
  Code,
  Info,
  LayoutDashboard,
  NotebookPen,
  PlugIcon,
  PlusCircle,
  Search,
  Settings,
  Star,
} from "lucide-react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import About from "./pages/About";
import DxtDetail from "./pages/DxtDetail";
import DxtPage from "./pages/DxtPage";
import { InstallAppPage } from "./pages/InstallApp";
import { useViewStore } from "./stores/viewStore";

export const AppRoutes = () => {
  const { view } = useViewStore();

  switch (view) {
    case "discover":
      return <Discover />;
    case "manage":
      return <Manage />;
    case "claude-code-manage":
      return <ClaudeCodeManage />;
    case "recently":
      return <Recently />;
    case "settings":
      return <SettingsPage />;
    case "auth":
      return <AuthPage />;
    case "about":
      return <About />;
    case "dxt":
      return <DxtPage />;
    case "dxt-detail":
      return <DxtDetail />;
    case "server":
      return <ServerPage />;
    case "install-app":
      return <InstallAppPage />;
    case "notes":
      return <NotesPage />;
    case "favorites":
      return (
        <ProtectedRoute>
          <Favorites />
        </ProtectedRoute>
      );
    case "dashboard":
      return (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      );
    case "onboarding":
      return (
        <ProtectedRoute>
          <OnBoarding />
        </ProtectedRoute>
      );
    default:
      return <Discover />;
  }
};

// Route configuration for navigation
export const getNavigationRoutes = (
  t: (key: string, options?: any) => string,
) => {
  const iconMap = {
    discover: <Search size={24} />,
    manage: <LayoutDashboard size={24} />,
    "claude-code-manage": <Code size={24} />,
    notes: <NotebookPen size={24} />,
    recently: <Clock size={24} />,
    favorites: <Star size={24} />,
    settings: <Settings size={24} />,
    about: <Info size={24} />,
    dxt: <PlugIcon size={24} />,
    download: <PlusCircle size={24} />,
  };

  return [
    {
      id: "discover",
      name: t("nav.discover"),
      path: "/discover",
      icon: iconMap.discover,
    },
    {
      id: "manage",
      name: t("nav.manage"),
      path: "/manage",
      icon: iconMap.manage,
    },
    {
      id: "dxt",
      name: t("nav.dxt"),
      path: "/dxt",
      icon: iconMap.dxt,
    },
    {
      id: "notes",
      name: "Notes",
      path: "/notes",
      icon: iconMap.notes,
    },
    {
      id: "claude-code-manage",
      name: "Claude Code",
      path: "/claude-code-manage",
      icon: iconMap["claude-code-manage"],
    },
    {
      id: "recently",
      name: t("nav.recentlyAdded"),
      path: "/recently",
      icon: iconMap.recently,
    },
    {
      id: "favorites",
      name: t("nav.favs"),
      path: "/favorites",
      icon: iconMap.favorites,
    },
    {
      id: "settings",
      name: t("nav.settings"),
      path: "/settings",
      icon: iconMap.settings,
    },
    {
      id: "about",
      name: t("nav.about"),
      path: "/about",
      icon: iconMap.about,
    },
    {
      id: "install-app",
      name: t("nav.installapp"),
      path: "/install-app",
      icon: iconMap.download,
    },
  ];
};
