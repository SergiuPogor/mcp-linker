import React, { createContext, useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface McpRefreshContextType {
  refreshServerList: (client?: string, path?: string) => void;
  refreshAllData: () => void;
  refreshCloudData: () => void;
}

const McpRefreshContext = createContext<McpRefreshContextType | null>(null);

export function McpRefreshProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const refreshServerList = useCallback((client?: string, path?: string) => {
    // Invalidate specific config queries
    if (client && path) {
      queryClient.invalidateQueries({ queryKey: ['mcp-config', client, path] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['mcp-config'] });
    }
    
    // Invalidate server list queries
    queryClient.invalidateQueries({ queryKey: ['mcp-servers'] });
    
    // Trigger custom event for non-React Query components
    window.dispatchEvent(new CustomEvent('mcpServerListChanged', { 
      detail: { client, path } 
    }));
  }, [queryClient]);

  const refreshAllData = useCallback(() => {
    queryClient.invalidateQueries();
    window.dispatchEvent(new CustomEvent('mcpDataRefresh'));
  }, [queryClient]);

  const refreshCloudData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['cloud-servers'] });
    queryClient.invalidateQueries({ queryKey: ['personal-cloud'] });
    queryClient.invalidateQueries({ queryKey: ['team-cloud'] });
    window.dispatchEvent(new CustomEvent('mcpCloudDataChanged'));
  }, [queryClient]);

  return (
    <McpRefreshContext.Provider value={{ 
      refreshServerList, 
      refreshAllData, 
      refreshCloudData 
    }}>
      {children}
    </McpRefreshContext.Provider>
  );
}

export function useMcpRefresh() {
  const context = useContext(McpRefreshContext);
  if (!context) {
    throw new Error('useMcpRefresh must be used within a McpRefreshProvider');
  }
  return context;
}