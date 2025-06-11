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
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <h3 className="text-red-800 font-medium">
          Error Loading Configuration
        </h3>
        <p className="text-red-600 mt-2">{error}</p>
        <div className="mt-4 space-x-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};
