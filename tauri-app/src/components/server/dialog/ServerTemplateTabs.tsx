import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { toast } from "sonner";
import JsonTab from "./JsonTab";
import SimpleTab from "./SimpleTab";
import UrlTab from "./UrlTab";
import { useServerTemplateLogic } from "./useServerTemplateLogic";

interface ServerTemplateTabsProps {
  logic: ReturnType<typeof useServerTemplateLogic>;
}

export const ServerTemplateTabs: React.FC<ServerTemplateTabsProps> = ({
  logic,
}) => {
  // Handler for importing a block from GithubJsonImportPanel
  const handleImportGithubBlock = (obj: any, serverName: string) => {
    logic.setConfig(obj);
    if (obj.env) logic.setEnvValues(obj.env);
    if (serverName) logic.setServerName(serverName);
    toast.success("Config imported!");
  };

  return (
    <Tabs defaultValue="simple">
      <TabsList className="w-full">
        <TabsTrigger value="simple">Form</TabsTrigger>
        <TabsTrigger value="json">json</TabsTrigger>
        <TabsTrigger value="url">githubUrl</TabsTrigger>
      </TabsList>

      <SimpleTab logic={logic} />
      <JsonTab logic={logic} />
      <UrlTab logic={logic} onImportGithubBlock={handleImportGithubBlock} />
    </Tabs>
  );
};
