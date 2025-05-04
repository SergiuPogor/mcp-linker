import { Category } from "@/types";
import { Clock, Download, Home, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

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
