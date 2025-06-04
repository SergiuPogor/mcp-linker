import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { ConfigType } from "@/types/mcpConfig";
import { ColumnDef } from "@tanstack/react-table";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { CommandDisplay } from "./CommandDisplay";
import { ServerActionButtons } from "./ServerActionButtons";
import { ServerStatusSwitch } from "./ServerStatusSwitch";
import { SyncConfigDialog } from "./SyncConfigDialog";

// Define props interface for McpServerTable
interface McpServerTableProps {
  servers: Array<{ name: string; [key: string]: any }>;
  onEdit?: (
    serverName: string,
    config: ConfigType["mcpServers"][string],
  ) => void;
  onDisable?: (serverName: string) => void;
  onDelete?: (serverName: string) => void;
  onEnable?: (serverName: string) => void;
  onSync?: (
    fromClient: string,
    toClient: string,
    overrideAll: boolean,
  ) => Promise<void>;
  disabledServers?: Record<string, any>;
  currentClient?: string;
}

export function McpServerTable({
  servers,
  onEdit,
  onDisable,
  onDelete,
  onEnable,
  onSync,
  disabledServers,
  currentClient,
}: McpServerTableProps) {
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async (
    fromClient: string,
    toClient: string,
    overrideAll: boolean,
  ) => {
    if (onSync) {
      try {
        setIsSyncing(true);
        await onSync(fromClient, toClient, overrideAll);
      } catch (error) {
        console.error("Sync failed:", error);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Define columns with improved layout
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Server Name",
      cell: ({ row }) => {
        const serverName = row.original.name;
        const isServerActive = !disabledServers?.[serverName];
        return (
          <div className="flex items-center gap-2">
            <div className="font-medium">{serverName}</div>
            <Badge
              variant={isServerActive ? "default" : "secondary"}
              className={`text-xs ${isServerActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}
            >
              {isServerActive ? "Active" : "Disabled"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "command",
      header: "Command",
      cell: ({ row }) => <CommandDisplay config={row.original} />,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const serverName = row.original.name;
        const isServerActive = !disabledServers?.[serverName];
        return (
          <ServerStatusSwitch
            serverName={serverName}
            isActive={isServerActive}
            onEnable={onEnable!}
            onDisable={onDisable!}
          />
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const serverName = row.original.name;
        const serverConfig = row.original;
        return (
          <ServerActionButtons
            serverName={serverName}
            serverConfig={serverConfig}
            onEdit={onEdit!}
            onDelete={onDelete!}
            onEnable={onEnable!}
            disabledServers={disabledServers}
          />
        );
      },
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Manage your MCP server configurations
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSyncDialogOpen(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Config
          </Button>
        </div>
      </div>

      <SyncConfigDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        onSync={handleSync}
        currentClient={currentClient}
        isSyncing={isSyncing}
      />

      <DataTable columns={columns} data={servers} searchKey="name" />
    </div>
  );
}
