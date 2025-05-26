import { Nav } from "@/types";
import { Clock, Download, LayoutGrid, Search, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

const useNav = (): Nav[] => {
  const { t } = useTranslation();
  return [
    {
      id: "discover",
      name: t("nav.discover"),
      icon: <Search size={24} />,
    },
    {
      id: "categories",
      name: t("nav.category"),
      icon: <LayoutGrid size={24} />,
    },
    {
      id: "manage",
      name: t("nav.manage"),
      icon: <Download size={24} />,
    },
    {
      id: "recently",
      name: t("nav.recentlyAdded"),
      icon: <Clock size={24} />,
    },
    {
      id: "favs",
      name: t("nav.favs"),
      icon: <Star size={24} />,
    },
  ];
};

export default useNav;
