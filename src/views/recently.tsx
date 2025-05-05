import { ServerCard } from "@/components/recently/ServerCard";
import { type ServerConfig } from "@/types";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  selectedClient: string;
  selectedPath: string;
}

export default function Recently({ selectedClient, selectedPath }: Props) {
  const [serverList, setServerList] = useState<
    { name: string; config: ServerConfig }[]
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem("myservers");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as {
          name: string;
          config: ServerConfig;
        }[];
        setServerList(parsed);
      } catch (error) {
        console.error("Failed to load myservers:", error);
      }
    }
  }, []);

  const handleAdd = async (key: string, updatedConfig: ServerConfig) => {
    try {
      await invoke("add_mcp_server", {
        clientName: selectedClient,
        path: selectedPath || undefined,
        serverName: key,
        serverConfig: updatedConfig,
      });
      try {
        console.log("Saving to myservers:", key, updatedConfig);
        const savedMyServers = localStorage.getItem("myservers");
        console.log("Current myservers:", savedMyServers);
        const parsedMyServers = savedMyServers
          ? JSON.parse(savedMyServers)
          : [];

        const newServer = {
          name: key,
          config: updatedConfig,
        };

        const index = parsedMyServers.findIndex((s: any) => s.name === key);
        if (index !== -1) {
          parsedMyServers[index] = newServer;
          console.log(`Updated existing server with name: ${key}`);
        } else {
          parsedMyServers.push(newServer);
          console.log(`Added new server with name: ${key}`);
        }

        localStorage.setItem("myservers", JSON.stringify(parsedMyServers));
        console.log("Updated myservers:", parsedMyServers);
      } catch (error) {
        console.error("Failed to save to myservers:", error);
      }
    } catch (error) {
      console.error(`Error updating config: ${error}`);
      toast.error("Failed to update configuration");
    }
  };

  const handleDelete = (key: string) => {
    try {
      const saved = localStorage.getItem("myservers");
      if (saved) {
        const parsed = JSON.parse(saved) as {
          name: string;
          config: ServerConfig;
        }[];
        const updated = parsed.filter((s) => s.name !== key);
        localStorage.setItem("myservers", JSON.stringify(updated));
        setServerList(updated);
        console.log(`Deleted server with name: ${key}`);
      }
    } catch (error) {
      console.error("Failed to delete server from myservers:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold p-2">
        Recently Used – Remembers Your Configurations
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 p-2">
        {serverList.map((server) => (
          <ServerCard
            key={server.name}
            serverKey={server.name}
            config={server.config}
            onAdd={handleAdd}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
