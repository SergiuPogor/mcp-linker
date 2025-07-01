// Custom hook to get servers data and update stats
// Always use English comments for code
import { useStatsStore } from "@/stores/statsStore";
import { ServerTableData } from "@/types";
import { useEffect, useMemo } from "react";

export function useServersData(
  config: any,
  disabledServers: any,
  selectedClient: string,
) {
  const setPersonalStats = useStatsStore((s) => s.setPersonalStats);

  const activeServers = useMemo(() => {
    return Object.entries(config?.mcpServers ?? {})
      .filter(([_, serverConfig]) => {
        if (typeof serverConfig !== "object" || serverConfig === null)
          return false;
        if (selectedClient === "cherrystudio") {
          return !(
            "isActive" in serverConfig &&
            (serverConfig as any).isActive === false
          );
        } else if (["cline", "roo_code"].includes(selectedClient)) {
          return !(
            "disabled" in serverConfig && (serverConfig as any).disabled
          );
        }
        return true;
      })
      .map(
        ([name, serverConfig]) =>
          ({
            name,
            ...(typeof serverConfig === "object" && serverConfig !== null
              ? serverConfig
              : {}),
          }) as ServerTableData,
      );
  }, [config?.mcpServers, selectedClient]);

  const disabledServersData = useMemo(() => {
    return Object.entries(disabledServers ?? {}).map(
      ([name, serverConfig]) =>
        ({
          name,
          ...(typeof serverConfig === "object" && serverConfig !== null
            ? serverConfig
            : {}),
        }) as ServerTableData,
    );
  }, [disabledServers]);

  const allServers = useMemo(() => {
    return [...activeServers, ...disabledServersData];
  }, [activeServers, disabledServersData]);

  useEffect(() => {
    setPersonalStats({
      total: allServers.length,
      active: activeServers.length,
      disabled: disabledServersData.length,
    });
  }, [
    allServers.length,
    activeServers.length,
    disabledServersData.length,
    setPersonalStats,
  ]);

  return allServers;
}
