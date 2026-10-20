import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BatchActionsDropdownProps {
  handleBatchEnable?: () => void;
  handleBatchDisable?: () => void;
  handleBatchDelete: () => void;
  isDeleting: boolean;
  hasSelectedRows: boolean;
}

export const BatchActionsDropdown = ({
  handleBatchEnable,
  handleBatchDisable,
  handleBatchDelete,
  isDeleting,
  hasSelectedRows,
}: BatchActionsDropdownProps) => {
  const { t } = useTranslation();
  return (
    <>
      {hasSelectedRows && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" >
              {t("manage.actions")} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {handleBatchEnable && (
              <DropdownMenuItem
                onClick={() => handleBatchEnable()}
              >
                {t("manage.enableSelected")}
              </DropdownMenuItem>
            )}
            {handleBatchDisable && (
              <DropdownMenuItem
                onClick={() => handleBatchDisable()}
              >
                {t("manage.disableSelected")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleBatchDelete} disabled={isDeleting}>
              {t("manage.deleteSelected")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};
