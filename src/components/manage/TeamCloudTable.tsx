import { DataTable } from "@/components/ui/data-table";
import { useClientPathStore } from "@/stores/clientPathStore";
import { ServerTableData } from "@/types";
import { RowSelectionState, Table } from "@tanstack/react-table";
import { useState } from "react";
import { createColumns } from "./TeamTableColumns";

export const TeamCloudTable = () => {
  const [_tableInstance, setTableInstance] =
    useState<Table<ServerTableData> | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [serversData, setServersData] = useState<ServerTableData[]>([]);
  const { selectedClient, selectedPath } = useClientPathStore();

  const columns = createColumns({
    selectedClient,
    selectedPath,
    setServersData,
  });

  return (
    <div className="flex flex-col">
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
