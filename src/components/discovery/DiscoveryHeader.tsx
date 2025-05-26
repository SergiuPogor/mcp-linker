import { SortOptions } from "@/components/settings/SortOptions";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface DiscoveryHeaderProps {
  sort: string;
  direction: string;
  onSortChange: (sort: string, direction: string) => void;
  onAddServer: () => void;
  onSellServer: () => void;
  isAuthenticated?: boolean;
}

export const DiscoveryHeader = ({
  sort,
  direction,
  onSortChange,
  onAddServer,
  onSellServer,
  isAuthenticated = false,
}: DiscoveryHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {t("featuredServers")}
      </h2>

      {/* Sorting and action buttons */}
      <div className="flex items-center gap-2">
        <SortOptions
          sort={sort}
          direction={direction}
          setSort={(newSort) => onSortChange(newSort, direction)}
          setDirection={(newDirection) => onSortChange(sort, newDirection)}
          onChangePageReset={() => {}}
        />
        <div className="flex gap-2">
          <Button onClick={onAddServer}>{t("addCustomServer")}</Button>
          <Button
            onClick={onSellServer}
            title={!isAuthenticated ? t("loginRequired") : undefined}
          >
            {t("sellServer")}
          </Button>
        </div>
      </div>
    </div>
  );
};
