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
import {
  Clock,
  Download,
  Info,
  LayoutGrid,
  Search,
  Settings,
  Star,
  Users
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import About from "./pages/About";
import TeamMemberPage from "./pages/TeamMemberPage";
import TeamPage from "./pages/TeamPage";

// Component to redirect to last visited route only on initial load
function StartupRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    const lastRoute = localStorage.getItem("lastRoute");
    // Only redirect if not already at lastRoute, and lastRoute is not "/" and not current path
    if (
      lastRoute &&
      lastRoute !== "/" &&
      lastRoute !== location.pathname
    ) {
      redirected.current = true;
      navigate(lastRoute, { replace: true });
    }
  }, [location, navigate]);

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
        <Route path="/" element={<Manage />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/recently" element={<Recently />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/servers/:id" element={<ServerPage />} />

        {/* Protected routes */}
        <Route
          path="/team"
          element={
            <ProtectedRoute requireAuth={true}>
              <TeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId/members"
          element={
            <ProtectedRoute requireAuth={true}>
              <TeamMemberPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute requireAuth={true}>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute requireAuth={true}>
              <OnBoarding />
            </ProtectedRoute>
          }
        />

        {/* Catch all route - redirect to home */}
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
    manage: <Download size={24} />,
    team: <Users size={24} />,
    recently: <Clock size={24} />,
    favorites: <Star size={24} />,
    settings: <Settings size={24} />,
    about: <Info size={24} />,
  };

  return [
    {
      id: "manage",
      name: t("nav.manage"),
      path: "/",
      icon: iconMap.manage,
    },
    {
      id: "team",
      name: t("nav.team"),
      path: "/team",
      icon: iconMap.team,
    },
    {
      id: "discover",
      name: t("nav.discover"),
      path: "/discover",
      icon: iconMap.discover,
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
  ];
};
