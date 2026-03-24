import { useCallback, useEffect, useState } from 'react';
import { ServerTableData } from '@/types';
import { toast } from 'sonner';

interface OptimisticServerAction {
  type: 'add' | 'update' | 'delete' | 'toggle';
  serverName: string;
  data?: any;
}

export function useOptimisticServerUpdate(
  initialServers: ServerTableData[],
  onServerOperation: (action: OptimisticServerAction) => Promise<void>,
) {
  const [optimisticServers, setOptimisticServers] = useState(initialServers);
  
  const addOptimisticUpdate = useCallback((action: OptimisticServerAction) => {
    setOptimisticServers(prevState => {
      switch (action.type) {
        case 'add':
          // Optimistically add new server to the list
          return [...prevState, { name: action.serverName, ...action.data }];
          
        case 'update':
          return prevState.map(server => 
            server.name === action.serverName 
              ? { ...server, ...action.data }
              : server
          );
          
        case 'delete':
          return prevState.filter(server => server.name !== action.serverName);
          
        case 'toggle':
          return prevState.map(server =>
            server.name === action.serverName
              ? { ...server, isActive: !(server as any).isActive }
              : server
          );
          
        default:
          return prevState;
      }
    });
  }, []);

  // Sync optimistic state with actual server data
  useEffect(() => {
    setOptimisticServers(initialServers);
  }, [initialServers]);

  const executeOptimisticUpdate = useCallback(async (
    action: OptimisticServerAction,
    rollbackMessage?: string
  ) => {
    // Apply optimistic update immediately
    addOptimisticUpdate(action);

    try {
      // Execute actual server operation
      await onServerOperation(action);
    } catch (error) {
      // Show error message with rollback info
      const message = error instanceof Error ? error.message : String(error);
      toast.error(rollbackMessage || `Failed to ${action.type} server: ${message}`);
      
      // The optimistic update will be reverted when the component re-renders
      // with the actual server data
      throw error;
    }
  }, [addOptimisticUpdate, onServerOperation]);

  return {
    optimisticServers,
    executeOptimisticUpdate,
  };
}