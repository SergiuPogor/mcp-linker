import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import capitalizeFirstLetter from "@/utils/title";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ServerTemplateTabs } from "./ServerTemplateTabs";
import { useServerTemplateLogic } from "./useServerTemplateLogic";

interface ServerTemplateDialogProps {
  isOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

export const ServerTemplateDialog = forwardRef<
  HTMLDivElement,
  ServerTemplateDialogProps
>((props, _ref) => {
  const { isOpen, setIsDialogOpen } = props;
  const { t } = useTranslation();

  // Use custom hook for all logic and state
  const logic = useServerTemplateLogic(isOpen, setIsDialogOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="overflow-y-auto max-h-[90vh] w-[90vw] max-w-3xl">
        <DialogHeader>
          <DialogTitle>MCP config</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {/* Tabs for config editing */}
        <ServerTemplateTabs logic={logic} />

        <DialogFooter>
          <Button
            onClick={async (e) => {
              e.preventDefault();
              logic.handleSubmitTeamLocal();
            }}
          >
            {t("addTo")} {t("teamLocal")}
          </Button>

          {/* Submit button for add */}
          <Button
            onClick={async (e) => {
              e.preventDefault();
              logic.handleSubmit();
            }}
          >
            {t("addTo")} {capitalizeFirstLetter(logic.selectedClient)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

ServerTemplateDialog.displayName = "ServerTemplateDialog";
