import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/apiClient";
import { useClientPathStore } from "@/store/clientPathStore";
import capitalizeFirstLetter from "@/utils/title";
import { invoke } from "@tauri-apps/api/core";
import { forwardRef, useState } from "react";
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
>((props, _ref) => {
  const { isOpen, setIsDialogOpen, isSell } = props;
  const { selectedClient, selectedPath } = useClientPathStore();
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);

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

  const handleSellServer = async () => {
    // Validate required fields
    if (!projectUrl || !config || !selectedCategoryId) {
      toast.error(
        "Please fill in all required fields (project URL, config, category)",
      );
      return;
    }
    try {
      // make sure config type
      let configWithType = { ...config };
      if (!("type" in configWithType)) {
        (configWithType as any).type = "stdio";
      }
      const payload = {
        name: serverName,
        description: projectDescription,
        categoryId: selectedCategoryId,
        source: projectUrl,
        developer: "",
        configs: [configWithType],
      };
      await apiClient.post("/servers/", payload);
      toast.success("Server upload successfully");
      setIsDialogOpen(false);
    } catch (error: any) {
      let message = "Failed to sell server";
      if (error?.response?.data?.message) {
        message += ": " + error.response.data.message;
      } else if (error?.message) {
        message += ": " + error.message;
      }
      console.error(message, error);
      toast.error(message);
    }
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
          setSelectedCategoryId={setSelectedCategoryId}
        />

        {isSell ? (
          <Button
            onClick={async (e) => {
              e.preventDefault();
              await handleSellServer();
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
