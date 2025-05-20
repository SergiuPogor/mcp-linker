import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClientPathStore } from "@/store/clientPathStore";
import capitalizeFirstLetter from "@/utils/title";
import { invoke } from "@tauri-apps/api/core";
import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ServerTemplateForm } from "../form/ServerTemplateForm";
import { useServerConfig } from "../hooks/useServerConfig";
import { transformConfig } from "../utils/transformConfig";

interface ServerTemplateDialogProps {
  isOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isSell: boolean;
}

export const ServerTemplateDialog = forwardRef<
  HTMLDivElement,
  ServerTemplateDialogProps
>(({ isOpen, setIsDialogOpen, isSell }) => {
  const { selectedClient, selectedPath } = useClientPathStore();
  const { t } = useTranslation();

  const {
    serverName,
    setServerName,
    projectUrl,
    setProjectUrl,
    projectDescription,
    setProjectDescription,
    serverType,
    setServerType,
    config,
    // setConfig,
    handleArgsChange,
    handleCommandChange,
    handleUrl,
    handleEnvChange,
    handletHeaderChange,
    envValues,
    setEnvValues,
    headerValues,
    setHeaderValues,
  } = useServerConfig(isOpen, selectedClient);

  const handleSellServer = () => {
    const payload = {
      configs: [config],
      categoryId: "",
      source: projectUrl,
      developer: "",
    };

    toast("Selling server: " + JSON.stringify(payload));
  };

  const handleSubmit = async () => {
    try {
      const finalConfig = transformConfig(serverType, config);

      await invoke("add_mcp_server", {
        clientName: selectedClient,
        path: selectedPath || undefined,
        serverName: serverName,
        serverConfig: finalConfig,
      });
      toast.success("Configuration updated successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(`Error updating config: ${error}`);
      toast.error("Failed to update configuration");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="overflow-y-auto max-h-[90vh] w-[90vw] max-w-3xl bg-background dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">config</DialogTitle>
          <DialogDescription>server config</DialogDescription>
        </DialogHeader>

        <ServerTemplateForm
          serverName={serverName}
          setServerName={setServerName}
          serverType={serverType}
          setServerType={setServerType}
          config={config}
          isSell={isSell}
          projectDescription={projectDescription}
          setProjectDescription={setProjectDescription}
          projectUrl={projectUrl}
          setProjectUrl={setProjectUrl}
          handleArgsChange={handleArgsChange}
          handleCommandChange={handleCommandChange}
          handleUrl={handleUrl}
          handleEnvChange={handleEnvChange}
          handletHeaderChange={handletHeaderChange}
          envValues={envValues}
          setEnvValues={setEnvValues}
          headerValues={headerValues}
          setHeaderValues={setHeaderValues}
        />

        {isSell ? (
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSellServer();
            }}
          >
            {t("sellServer")}
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {t("addTo")} {capitalizeFirstLetter(selectedClient)}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
});

ServerTemplateDialog.displayName = "ServerTemplateDialog";
