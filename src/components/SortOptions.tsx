import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowUp, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SortOptionsProps {
  sort: string;
  direction: string;
  setSort: (value: string) => void;
  setDirection: (value: string) => void;
  onChangePageReset: () => void;
}

export function SortOptions({
  sort,
  direction,
  setSort,
  setDirection,
  onChangePageReset,
}: SortOptionsProps) {
  const { t } = useTranslation();

  const getSortOptionText = () => {
    switch (sort) {
      case "github_stars":
        return t("sortByGithubStars");
      case "created_at":
        return t("sortByCreatedAt");
      case "views":
        return t("views");
      case "downloads":
        return t("downloads");
      default:
        return t("sortByGithubStars");
    }
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onChangePageReset();
  };

  const handleDirectionChange = (value: string) => {
    setDirection(value);
    onChangePageReset();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-40 justify-between">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-500" />
            {getSortOptionText()}
          </span>
          {direction === "desc" ? (
            <ArrowDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ArrowUp className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("sortOptions")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
            <DropdownMenuRadioItem value="github_stars">
              {t("sortByGithubStars")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="created_at">
              {t("sortByCreatedAt")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="views">
              {t("views")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="downloads">
              {t("downloads")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup
            value={direction}
            onValueChange={handleDirectionChange}
          >
            <DropdownMenuRadioItem
              value="desc"
              className="flex items-center justify-between"
            >
              {t("descend")}
              <ArrowDown className="h-4 w-4 ml-2" />
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="asc"
              className="flex items-center justify-between"
            >
              {t("ascend")}
              <ArrowUp className="h-4 w-4 ml-2" />
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
