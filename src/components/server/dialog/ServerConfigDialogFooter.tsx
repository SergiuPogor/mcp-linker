// ServerConfigDialogFooter.tsx
import { Button } from "@/components/ui/button";
import capitalizeFirstLetter from "@/utils/title";
import { useTranslation } from "react-i18next";

interface ServerConfigDialogFooterProps {
  onSubmit: () => Promise<void>;
  selectedClient: string;
}

export const ServerConfigDialogFooter = ({
  onSubmit,
  selectedClient,
}: ServerConfigDialogFooterProps) => {
  const { t } = useTranslation();

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {t("addTo")} {capitalizeFirstLetter(selectedClient)}
    </Button>
  );
};
