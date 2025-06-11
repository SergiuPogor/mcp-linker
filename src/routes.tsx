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
import { Clock, Download, LayoutGrid, Search, Star } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import TeamMemberPage from "./pages/TeamMemberPage";
import TeamPage from "./pages/TeamPage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Manage />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/recently" element={<Recently />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/auth" element={<AuthPage />} />
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
    team: <Download size={24} />,
    recently: <Clock size={24} />,
    favorites: <Star size={24} />,
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
  ];
};
