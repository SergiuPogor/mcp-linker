import { Button } from "@/components/ui/button";
import React from "react";

interface RefreshMcpConfigProps {
  error: string;
  onRetry: () => void;
}

export const RefreshMcpConfig: React.FC<RefreshMcpConfigProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <h3 className="text-destructive font-medium">
          Error Loading Configuration
        </h3>
        <p className="text-destructive/80 mt-2">{error}</p>
        <div className="mt-4 space-x-2">
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            Retry
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};
