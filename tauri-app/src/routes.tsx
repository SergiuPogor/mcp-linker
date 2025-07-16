// Remove window global augmentation, use Zustand store instead
import AuthPage from "@/pages/AuthPage";
import Categories from "@/pages/categories";
import Dashboard from "@/pages/Dashboard";
import Discover from "@/pages/Discover";
import Favorites from "@/pages/favorites";
import Manage from "@/pages/manage";
import OnBoarding from "@/pages/OnBoarding";
import Recently from "@/pages/recently";
import SearchPage from "@/pages/search";
import { ServerPage } from "@/pages/ServerPage";
import SettingsPage from "@/pages/SettingsPage";
import { useDeepLinkStore } from "@/stores/deepLinkStore";
import {
  Clock,
  Info,
  LayoutDashboard,
  LayoutGrid,
  Search,
  Settings,
  Star,
  Users,
} from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import About from "./pages/About";
import DxtDetail from "./pages/DxtDetail";
import DxtPage from "./pages/DxtPage";
import { InstallAppPage } from "./pages/InstallApp";
import TeamMemberPage from "./pages/TeamMemberPage";
import TeamPage from "./pages/TeamPage";

// Component to redirect to last visited route only on initial load
function StartupRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirected = useRef(false);
  const isHandlingDeepLink = useDeepLinkStore((s) => s.isHandlingDeepLink);

  useEffect(() => {
    if (redirected.current) return;
    if (isHandlingDeepLink) return; // Skip redirect if deep link navigation is in progress
    const lastRoute = localStorage.getItem("lastRoute");
    // Only redirect if not already at lastRoute, and lastRoute is not "/" and not current path
    if (lastRoute && lastRoute !== "/" && lastRoute !== location.pathname) {
      redirected.current = true;
      navigate(lastRoute, { replace: true });
    }
  }, [location, navigate, isHandlingDeepLink]);

  return null;
}

export const AppRoutes = () => {
  const location = useLocation();

  // Save current path to localStorage on every route change
  useEffect(() => {
    localStorage.setItem("lastRoute", location.pathname + location.search);
  }, [location]);

  return (
    <>
      {/* Only redirect to last visited route on initial load */}
      <StartupRedirect />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Discover />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/recently" element={<Recently />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/dxt" element={<DxtPage />} />
        <Route path="/dxt/:id" element={<DxtDetail />} />
        <Route path="/servers/:id" element={<ServerPage />} />
        <Route path="/install-app" element={<InstallAppPage />} />
        <Route path="/servers/:owner/:repo" element={<ServerPage />} />

        {/* Protected routes */}
        {/* Use an array and map to simplify protected routes */}
        {[
          { path: "/team", element: <TeamPage /> },
          { path: "/teams/:teamId/members", element: <TeamMemberPage /> },
          { path: "/favorites", element: <Favorites /> },
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/onboarding", element: <OnBoarding /> },
        ].map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute requireAuth={true}>{element}</ProtectedRoute>
            }
          />
        ))}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

// Route configuration for navigation
export const getNavigationRoutes = (
  t: (key: string, options?: any) => string,
) => {
  const iconMap = {
    discover: <Search size={24} />,
    categories: <LayoutGrid size={24} />,
    manage: <LayoutDashboard size={24} />,
    team: <Users size={24} />,
    recently: <Clock size={24} />,
    favorites: <Star size={24} />,
    settings: <Settings size={24} />,
    about: <Info size={24} />,
    dxt: <Info size={24} />,
  };

  return [
    {
      id: "discover",
      name: t("nav.discover"),
      path: "/discover",
      icon: iconMap.discover,
    },
    {
      id: "dxt",
      name: t("nav.dxt"),
      path: "/dxt",
      icon: iconMap.dxt,
    },
    {
      id: "manage",
      name: t("nav.manage"),
      path: "/manage",
      icon: iconMap.manage,
    },
    {
      id: "team",
      name: t("nav.team"),
      path: "/team",
      icon: iconMap.team,
    },
    {
      id: "categories",
      name: t("nav.category"),
      path: "/categories",
      icon: iconMap.categories,
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
      icon: iconMap.about,
    },
  ];
};
