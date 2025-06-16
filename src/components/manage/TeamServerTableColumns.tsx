import { Checkbox } from "@/components/ui/checkbox";
import { ServerConfig, ServerTableData } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { TeamServerActionButtons } from "../team/TeamServerActionButtons";
import { CommandDisplay } from "./CommandDisplay";

interface ServerTableColumnsProps {
  onEdit: (name: string, config: ServerConfig) => void;
  onDelete: (name: string) => void;
}

export const useServerTableColumns = ({
  onEdit,
  onDelete,
}: ServerTableColumnsProps): ColumnDef<ServerTableData>[] => [
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
    cell: ({ row }) => {
      const serverName = row.original.name;
      return (
        <div className="flex items-center gap-2">
          <div className="font-medium">{serverName}</div>
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const serverName = row.original.name;
      const serverConfig = row.original;
      return (
        <TeamServerActionButtons
          serverName={serverName}
          serverConfig={serverConfig}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];
