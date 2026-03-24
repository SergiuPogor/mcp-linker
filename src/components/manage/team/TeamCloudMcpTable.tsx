import { DeleteAlertDialog } from "@/components/common/DeleteAlertDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTeamCloudSync } from "@/hooks/useTeamCloudSync";
import { api } from "@/lib/api";
import { useClientPathStore } from "@/stores/clientPathStore";
import { useTeamStore } from "@/stores/team";
import { ServerTableData } from "@/types";
import { ColumnDef, RowSelectionState, Table } from "@tanstack/react-table";
import { invoke } from "@tauri-apps/api/core";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommandDisplay } from "../CommandDisplay";

export const TeamCloudMcpTable = () => {
  const [_tableInstance, setTableInstance] =
    useState<Table<ServerTableData> | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [serversData, setServersData] = useState<ServerTableData[]>([]);
  const { selectedClient, selectedPath } = useClientPathStore();
  const { selectedTeamId, selectedTeamName } = useTeamStore();

  const { fetchCloudDownload } = useTeamCloudSync(serversData);

  useEffect(() => {
    // Only fetch data if we have a valid team selected
    if (!selectedTeamId) {
      setServersData([]);
      return;
    }

    let isMounted = true;
    fetchCloudDownload(selectedTeamId).then((cloudData) => {
      console.log("cloudData", cloudData);
      if (isMounted && cloudData) {
        setServersData(cloudData);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedTeamId, fetchCloudDownload]);

  const columns: ColumnDef<ServerTableData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Server Name",
    },
    {
      id: "command",
      header: "Command",
      cell: ({ row }) => <CommandDisplay config={row.original} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const serverName = row.original.name;
        const serverId = row.original.id;
        const serverConfig = row.original;
        return (
          <span>
            <Button
              onClick={async () => {
                try {
                  await invoke("add_mcp_server", {
                    clientName: selectedClient,
                    path: selectedPath || undefined,
                    serverName: serverName,
                    serverConfig: serverConfig,
                  });
                  toast.success(`add server ${serverName}`);
                } catch (e) {
                  toast.error(JSON.stringify(e));
                }

                try {
                  await api.post("/servers/add_mcp_server_stats", {
                    clientName: selectedClient,
                    serverName: serverName,
                  });
                } catch (e) {}
              }}
            >
              add
            </Button>

            <DeleteAlertDialog
              itemName={`the server "${serverName}"`}
              onDelete={async () => {
                try {
                  await api.delete(
                    `/teams/${selectedTeamId}/configs/${serverId}`,
                  );
                  setServersData((prevData) =>
                    prevData.filter((server) => server.id !== serverId),
                  );
                  toast.success(`remove server ${serverId} ${serverName}`);
                } catch (e) {
                  toast.error(JSON.stringify(e));
                }
              }}
            />
          </span>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DeleteAlertDialog
                    itemName={`all team **(${selectedTeamName})** server configs`}
                    onDelete={async () => {
                      try {
                        await api.delete(`/teams/${selectedTeamId}/configs`);
                        setServersData([]);
                        toast.success(
                          `remove team ${selectedTeamName} server configs in the cloud`,
                        );
                      } catch (e) {
                        toast.error(JSON.stringify(e));
                      }
                    }}
                    trigger={
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Trash2 />
                        Delete Team Config
                      </Button>
                    }
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Only use if encryptionKey has changed.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={serversData}
        searchKey="name"
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        onTableInstanceChange={setTableInstance}
      />
    </div>
  );
};
