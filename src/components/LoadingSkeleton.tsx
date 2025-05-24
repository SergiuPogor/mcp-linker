import React from "react";

interface LoadingSkeletonProps {
  type?: "app" | "content" | "page";
  className?: string;
}

// Skeleton component that pulses
const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  />
);

// Loading skeleton that preserves layout structure
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = "content",
  className = "",
}) => {
  // App-level loading - preserves full layout
  if (type === "app") {
    return (
      <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="flex-shrink-0 w-16 h-full bg-gray-100 dark:bg-gray-800 p-2">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonBox key={i} className="h-8 w-8 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Main area skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Nav bar skeleton */}
          <div className="flex justify-between p-2 border-b border-gray-200 dark:border-gray-700">
            <SkeletonBox className="h-8 w-32" />
            <SkeletonBox className="h-8 w-24" />
            <SkeletonBox className="h-8 w-20" />
          </div>

          {/* Content skeleton */}
          <div className="flex-1 p-4 space-y-4">
            <SkeletonBox className="h-8 w-3/4" />
            <SkeletonBox className="h-4 w-1/2" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <SkeletonBox key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Content-level loading - fits within existing layout
  if (type === "content") {
    return (
      <div className={`p-4 space-y-4 ${className}`}>
        <SkeletonBox className="h-8 w-3/4" />
        <SkeletonBox className="h-4 w-1/2" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <SkeletonBox className="h-6 w-3/4 mb-2" />
              <SkeletonBox className="h-4 w-full mb-1" />
              <SkeletonBox className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Page-level loading - minimal placeholder
  if (type === "page") {
    return (
      <div
        className={`flex items-center justify-center min-h-[200px] ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
};

// Specific loading components for different contexts
export const AppLoadingSkeleton = () => <LoadingSkeleton type="app" />;
export const ContentLoadingSkeleton = () => <LoadingSkeleton type="content" />;
export const PageLoadingSkeleton = () => <LoadingSkeleton type="page" />;
