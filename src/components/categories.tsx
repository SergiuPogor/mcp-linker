import { useTranslation } from "react-i18next";
import { Home, Download, Clock, Star } from "lucide-react";
import { Category } from "@/types";

const useAppCategories = (): Category[] => {
  const { t } = useTranslation();
  return [
    {
      id: "discover",
      name: t("categories.discover"),
      icon: <Home size={24} />,
      content: t("content.discover"),
    },
    {
      id: "manage",
      name: t("categories.manage"),
      icon: <Download size={24} />,
      content: t("content.manage"),
    },
    {
      id: "recently",
      name: t("categories.recentlyAdded"),
      icon: <Clock size={24} />,
      content: t("content.recentlyAdded"),
    },
    {
      id: "favs",
      name: t("categories.favs"),
      icon: <Star size={24} />,
      content: t("content.favs"),
    },
  ];
};

export default useAppCategories;
