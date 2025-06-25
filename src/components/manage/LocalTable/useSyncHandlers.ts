// Custom hook for sync handlers (local and cloud)
// Always use English comments for code
import { useCallback } from "react";

export function useSyncHandlers(
  syncConfig: any,
  handleCloudUpload: any,
  handleCloudDownload: any,
) {
  // Local sync handler
  const handleSync = useCallback(
    (fromClient: string, toClient: string, overrideAll: boolean) => {
      return syncConfig(fromClient, toClient, overrideAll);
    },
    [syncConfig],
  );

  // Cloud sync handlers are passed through
  return {
    handleSync,
    handleCloudUpload,
    handleCloudDownload,
  };
}
