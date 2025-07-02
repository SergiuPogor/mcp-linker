import { ContentLoadingFallback } from "@/components/common/LoadingConfig";
import { ServerConfigForm } from "@/components/server/form/ServerConfigForm";
import { useServerConfig } from "@/components/server/hooks/useServerConfig";
import { ServerBadge, ServerMeta } from "@/components/server/ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGithubReadmeJson } from "@/hooks/useGithubReadmeJson";
import { api } from "@/lib/api";
import { useClientPathStore } from "@/stores/clientPathStore";
import { useConfigFileStore } from "@/stores/configFileStore";
import { useTeamStore } from "@/stores/team";
import type { ServerType } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { ChevronLeft, Download, Eye, Github, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export function ServerPage() {
  const [server, setServer] = useState<ServerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id, owner, repo } = useParams();
  const navigate = useNavigate();

  const { selectedClient, selectedPath } = useClientPathStore();
  const { getTeamConfigPath } = useConfigFileStore();
  const { selectedTeamId } = useTeamStore();

  // Always call hooks at the top level
  const {
    serverName,
    setServerName,
    config,
    setConfig,
    envValues,
    setEnvValues,
    handleArgsChange,
    handleCommandChange,
    handleEnvChange,
  } = useServerConfig(true, selectedClient);

  // For demo, configs/curIndex/onConfigChange are single config only
  const configs = [config];
  const curIndex = 0;
  const onConfigChange = (c: any, _i: number) => setConfig(c);
  const onSseConfigChange = (c: any) => setConfig(c);

  // Move onSubmit and handleSubmitTeamLocal below useServerConfig so they can access serverName
  const onSubmit = async () => {
    try {
      if (serverName) {
        await invoke("add_mcp_server", {
          clientName: selectedClient,
          path: selectedPath || undefined,
          serverName: serverName,
          serverConfig: config,
        });
        toast.success(`add server ${serverName}`);
      } else {
        toast.error("no server name");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(
        `add server Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  const handleSubmitTeamLocal = async () => {
    try {
      await invoke("add_mcp_server", {
        clientName: "custom",
        path: getTeamConfigPath(selectedTeamId),
        serverName: serverName,
        serverConfig: config,
      });
      toast.success(`add to Team Local ok`);
    } catch (e: any) {
      console.error(e);
      toast.error(
        `add to Team Failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
    }
  };

  // Add the useGithubReadmeJson hook
  const { fetchAllJsonBlocks } = useGithubReadmeJson();

  // Helper to safely set server and config state
  function applyServerConfig(serverData: any) {
    setServer(serverData);
    setServerName(serverData.name);
    // Always use the first config item if available
    const configItem = serverData.serverConfigs?.[0]?.configItems?.[0] || {};
    setConfig(configItem);
    // Ensure env is always an object
    setEnvValues(configItem.env || {});
  }

  useEffect(() => {
    const fetchServer = async () => {
      setIsLoading(true);
      try {
        let serverData = null;
        if (id) {
          const res = await api.get(`/servers/${id}`);
          serverData = res.data;
          applyServerConfig(res.data);
        } else if (owner && repo) {
          const serverRepoUrl = `/servers/@${owner}/${repo}`;
          const res = await api.get(serverRepoUrl);
          serverData = res.data;
          applyServerConfig(res.data);
        }

        // Auto submit logic if needed
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("autoSubmit") === "true" && serverData) {
          toast.loading("Auto-submitting in 3 seconds...");
          setTimeout(async () => {
            try {
              await invoke("add_mcp_server", {
                clientName: selectedClient,
                path: selectedPath || undefined,
                serverName: serverData.name,
                serverConfig:
                  serverData.serverConfigs?.[0]?.configItems?.[0] || {},
              });
              toast.success(`add server ${serverData.name}`);
            } catch (e: any) {
              console.error(e);
              toast.error(`add server Failed: ${JSON.stringify(e)}`);
            }
          }, 3000);
        }
      } catch (e: any) {
        // If API fetch fails, try to fetch JSON blocks from GitHub README
        console.error("Failed to fetch data", e);
        toast.info("Trying to fetch from GitHub README...");
        try {
          // Construct GitHub repo URL from owner/repo params
          if (owner && repo) {
            const githubUrl = `https://github.com/${owner}/${repo}`;
            const jsonBlocks = await fetchAllJsonBlocks(githubUrl);
            let found = false;
            if (jsonBlocks && jsonBlocks.length > 0) {
              for (const block of jsonBlocks) {
                if (
                  block &&
                  typeof block === "object" &&
                  block.mcpServers &&
                  typeof block.mcpServers === "object"
                ) {
                  const mcpServers = block.mcpServers;
                  const serverNames = Object.keys(mcpServers);
                  if (serverNames.length > 0) {
                    const firstName = serverNames[0];
                    const configValue = mcpServers[firstName];
                    const fallbackServer: ServerType = {
                      id: "",
                      name: firstName,
                      developer: owner,
                      logoUrl: "",
                      description: "",
                      category: "",
                      source: githubUrl,
                      isOfficial: false,
                      githubStars: 0,
                      downloads: 0,
                      rating: 0,
                      views: 0,
                      isFavorited: false,
                      tags: [],
                      tools: [],
                    };
                    // Use helper to set state, ensure env fallback
                    setServer(fallbackServer);
                    setServerName(firstName);
                    setConfig(configValue);
                    setEnvValues(configValue.env || {});
                    toast.success("Loaded config from GitHub README");
                    found = true;
                    break;
                  }
                }
              }
              if (!found) {
                toast.error(
                  "No valid mcpServers found in any GitHub README block",
                );
              }
            } else {
              toast.error("No valid JSON config found in GitHub README");
            }
          } else {
            toast.error("No owner/repo info for GitHub fallback");
          }
        } catch (error) {
          // Fallback also failed
          toast.error("Failed to fetch from GitHub README");
        }
      } finally {
        setIsLoading(false);
        toast.dismiss();
      }
    };
    fetchServer();
  }, [id, owner, repo]);

  if (isLoading) return <ContentLoadingFallback />;
  if (!server)
    return (
      <div>
        Server not found {owner} {repo} {id}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft /> Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{server.name}</span>
            <ServerBadge isOfficial={server.isOfficial} />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{server.description}</p>

          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <ServerMeta icon={User} value={server.developer} />
            <ServerMeta icon={Star} value={server.rating?.toFixed(1)} />
            <ServerMeta icon={Github} value={server.githubStars} />
            <ServerMeta icon={Download} value={server.downloads} />
            <ServerMeta icon={Eye} value={server.views} />
          </div>
        </CardContent>
      </Card>

      <ServerConfigForm
        serverName={serverName}
        setServerName={setServerName}
        configs={configs}
        curIndex={curIndex}
        onConfigChange={onConfigChange}
        config={config}
        envValues={envValues}
        setEnvValues={setEnvValues}
        onCommandChange={handleCommandChange}
        onArgsChange={handleArgsChange}
        onEnvChange={handleEnvChange}
        onSseConfigChange={onSseConfigChange}
        onSubmit={onSubmit}
        selectedClient={selectedClient}
        onSubmitTeamLocal={handleSubmitTeamLocal}
      />
    </div>
  );
}
