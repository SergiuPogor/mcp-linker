import { DeleteAlertDialog } from "@/components/common/DeleteAlertDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { ServerTableData } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { CommandDisplay } from "../CommandDisplay";

interface TeamTableColumnsProps {
  selectedClient: string;
  selectedPath: string | null;
  setServersData: React.Dispatch<React.SetStateAction<ServerTableData[]>>;
}

export const createColumns = ({
  selectedClient,
  selectedPath,
  setServersData,
}: TeamTableColumnsProps): ColumnDef<ServerTableData>[] => [
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
              await invoke("add_mcp_server", {
                clientName: selectedClient,
                path: selectedPath || undefined,
                serverName: serverName,
                serverConfig: serverConfig,
              });
              toast.success(`add server ${serverName}`);
            }}
          >
            add
          </Button>

          <DeleteAlertDialog
            itemName={`the server "${serverName}"`}
            onDelete={async () => {
              try {
                await api.delete(`/user-server-configs/${serverId}`);
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
