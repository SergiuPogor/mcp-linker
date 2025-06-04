import AuthPage from "@/pages/AuthPage";
import Categories from "@/pages/categories";
import Dashboard from "@/pages/Dashboard";
import Discover from "@/pages/Discover";
import Favorites from "@/pages/favorites";
import Manage from "@/pages/manage";
import OnBoarding from "@/pages/OnBoarding";
import Recently from "@/pages/recently";
import { ServerPage } from "@/pages/ServerPage";
import { Clock, Download, LayoutGrid, Search, Star } from "lucide-react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Discover />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/manage" element={<Manage />} />
      <Route path="/recently" element={<Recently />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/servers/:id" element={<ServerPage />} />

      {/* Protected routes */}
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
    recently: <Clock size={24} />,
    favorites: <Star size={24} />,
  };

  return [
    {
      id: "discover",
      name: t("nav.discover"),
      path: "/",
      icon: iconMap.discover,
    },
    {
      id: "categories",
      name: t("nav.category"),
      path: "/categories",
      icon: iconMap.categories,
    },
    {
      id: "manage",
      name: t("nav.manage"),
      path: "/manage",
      icon: iconMap.manage,
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
