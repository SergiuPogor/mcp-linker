import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServerConfig, SseConfig, StdioServerConfig } from "@/types";
import capitalizeFirstLetter from "@/utils/title";
import { invoke } from "@tauri-apps/api/core";
import { forwardRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ArgsTextarea } from "./ArgsTextarea";
import { CommandInput } from "./CommandInput";
import { EnvEditor } from "./EnvEditor";
import { HeaderEditor } from "./HeaderEditor";
import { ServerNameInput } from "./ServerNameInput";

interface ServerTemplateDialogProps {
  isOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  selectedClient: string;
  selectedPath: string;
}

export const ServerTemplateDialog = forwardRef<
  HTMLDivElement,
  ServerTemplateDialogProps
>(({ isOpen, setIsDialogOpen, selectedClient, selectedPath }) => {
  const [serverName, setServerName] = useState<string>("");
  const [serverType, setServerType] = useState<string>("stdio");

  // Create separate templates for different server types
  const stdioConfigTemplate: StdioServerConfig = {
    command: "",
    args: [],
    env: {},
  };

  const networkConfigTemplate: SseConfig = {
    type: "sse",
    url: "http://localhost:8000/sse",
    headers: {},
  };

  // Use the appropriate template based on server type
  const configTemplate =
    serverType === "stdio" ? stdioConfigTemplate : networkConfigTemplate;

  const [config, setConfig] = useState<ServerConfig>(stdioConfigTemplate);
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [headerValues, setHeaderValues] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  const commands = ["uvx", "bunx", "npx", "docker"];

  const exampleTemplates: Record<string, ServerConfig> = {
    "brave-search": configTemplate,
  };

  // Initialize server data
  useEffect(() => {
    if (isOpen && selectedClient) {
      const template = exampleTemplates[selectedClient];
      if (template) {
        setServerName(selectedClient);
        setConfig(template);
      }
    }
  }, [isOpen, selectedClient]);

  // Update config template when server type changes
  useEffect(() => {
    if (serverType === "stdio") {
      setConfig((prev) => {
        const newConfig: StdioServerConfig = {
          command: "command" in prev ? prev.command : "",
          args: "args" in prev ? prev.args : [],
          env: "env" in prev ? prev.env : {},
        };
        return newConfig;
      });
    } else {
      setConfig((prev) => {
        const newConfig: SseConfig = {
          type: serverType as "http" | "sse",
          url: "url" in prev ? prev.url : "http://localhost:8000/sse",
          headers: "headers" in prev ? prev.headers : {},
        };
        return newConfig;
      });
    }
  }, [serverType]);

  const handleArgsChange = (value: string) => {
    const newArgs = value.split(" ").filter((arg) => arg !== "");
    if (
      "args" in config &&
      JSON.stringify(newArgs) !== JSON.stringify(config.args)
    ) {
      setConfig({ ...config, args: newArgs });
    }
  };

  const handleCommandChange = (value: string) => {
    if ("command" in config) {
      setConfig({ ...config, command: value });
    }
  };

  const handleUrl = (value: string) => {
    if ("url" in config) {
      setConfig({ ...config, url: value });
    }
  };

  const handleEnvChange = (key: string, value: string) => {
    if ("env" in config && config.env) {
      setConfig({ ...config, env: { ...config.env, [key]: value } });
    }
  };

  const handletHeaderChange = (key: string, value: string) => {
    if ("headers" in config && config.headers) {
      setConfig({ ...config, headers: { ...config.headers, [key]: value } });
    }
  };

  const handleSubmit = async () => {
    console.log(config);
    try {
      let finalConfig: ServerConfig;

      if (serverType === "stdio" && "command" in config && "args" in config) {
        finalConfig = {
          command: config.command,
          args: config.args,
          env: config.env || {},
        };
      } else if (
        (serverType === "sse" || serverType === "http") &&
        "url" in config &&
        "headers" in config
      ) {
        finalConfig = {
          type: serverType as "http" | "sse",
          url: config.url,
          headers: config.headers || {},
        };
      } else {
        throw new Error("Invalid config structure for selected server type.");
      }

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

        <ServerNameInput serverName={serverName} onChange={setServerName} />

        <Select defaultValue={serverType} onValueChange={setServerType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a server type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="stdio">Stdio</SelectItem>
              <SelectItem value="sse">SSE</SelectItem>
              <SelectItem value="http">Http</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {serverType === "stdio" && (
          <div>
            <CommandInput
              command={"command" in config ? config.command : ""}
              onChange={handleCommandChange}
            />

            <div className="flex gap-2 flex-wrap">
              {commands.map((command) => (
                <Button
                  key={command}
                  variant="outline"
                  onClick={() => handleCommandChange(command)}
                >
                  {command}
                </Button>
              ))}
            </div>

            <ArgsTextarea
              args={"args" in config ? config.args : []}
              onChange={handleArgsChange}
            />

            <EnvEditor
              env={"env" in config ? config.env || {} : {}}
              envValues={envValues}
              setEnvValues={setEnvValues}
              onEnvChange={handleEnvChange}
              isEdit={true}
            />
          </div>
        )}

        {(serverType === "sse" || serverType === "http") && (
          <div>
            <div className="grid gap-2">
              <Label className="text-foreground dark:text-gray-200">Url</Label>
              <Input
                value={"url" in config ? config.url : ""}
                onChange={(e) => handleUrl(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-500 dark:text-white"
              />
            </div>
            <HeaderEditor
              header={"headers" in config ? config.headers || {} : {}}
              headerValues={headerValues}
              setHeaderValues={setHeaderValues}
              onHeaderChange={handletHeaderChange}
            />
          </div>
        )}

        <Button
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {t("addTo")} {capitalizeFirstLetter(selectedClient)}
        </Button>
      </DialogContent>
    </Dialog>
  );
});

ServerTemplateDialog.displayName = "ServerTemplateDialog";
