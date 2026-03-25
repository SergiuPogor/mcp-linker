// ServerConfigDialogFooter.tsx
import { Button } from "@/components/ui/button";
import { useViewStore } from "@/stores/viewStore";
import capitalizeFirstLetter from "@/utils/title";
import { useTranslation } from "react-i18next";

interface ServerConfigDialogFooterProps {
  onSubmit: () => Promise<void>;
  onSubmitTeamLocal?: () => Promise<void>;
  selectedClient: string;
}

export const ServerConfigDialogFooter = ({
  onSubmit,
  onSubmitTeamLocal,
  selectedClient,
}: ServerConfigDialogFooterProps) => {
  const { t } = useTranslation();
  const { navigate } = useViewStore();

  return (
    <div className="flex gap-2">
      <Button
        onClick={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {t("addTo")} {capitalizeFirstLetter(selectedClient)}
      </Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          onSubmitTeamLocal?.();
        }}
      >
        {t("addTo")} {t("teamLocal")}
      </Button>

      <Button
        onClick={() => {
          navigate("/manage");
        }}
      >
        Manage
      </Button>
    </div>
  );
};
