/**
 * Loading Configuration System
 *
 * This file centralizes all loading states to prevent AI from accidentally
 * breaking the layout structure. Do not modify fallback components directly.
 *
 * IMPORTANT: When working with AI assistants, always reference this file
 * for loading states instead of creating simple <div>Loading...</div> components.
 */

import { LoadingSkeleton } from "./LoadingSkeleton";

// Loading configuration - DO NOT modify without preserving layout structure
export const LOADING_CONFIG = {
  // App-level loading preserves full layout (sidebar + nav + content)
  APP_LOADING: () => <LoadingSkeleton type="app" />,

  // Content-level loading fits within existing layout structure
  CONTENT_LOADING: () => <LoadingSkeleton type="content" />,

  // Page-level loading for minimal contexts
  PAGE_LOADING: () => <LoadingSkeleton type="page" />,

  // Custom loading with preserved structure
  CUSTOM_LOADING: (message?: string) => (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message || "Loading..."}
        </p>
      </div>
    </div>
  ),
};

// Safe fallback components that maintain layout integrity
export const SafeLoadingFallbacks = {
  // For Suspense fallbacks in main app
  AppFallback: LOADING_CONFIG.APP_LOADING,

  // For Suspense fallbacks in content areas
  ContentFallback: LOADING_CONFIG.CONTENT_LOADING,

  // For Suspense fallbacks in pages/components
  PageFallback: LOADING_CONFIG.PAGE_LOADING,

  // For custom loading states
  CustomFallback: LOADING_CONFIG.CUSTOM_LOADING,
};

// Export individual components for convenience
export const AppLoadingFallback = SafeLoadingFallbacks.AppFallback;
export const ContentLoadingFallback = SafeLoadingFallbacks.ContentFallback;
export const PageLoadingFallback = SafeLoadingFallbacks.PageFallback;
export const CustomLoadingFallback = SafeLoadingFallbacks.CustomFallback;

/**
 * Usage Guidelines:
 *
 * 1. App-level Suspense (preserves full layout):
 *    <Suspense fallback={<AppLoadingFallback />}>
 *
 * 2. Content-level Suspense (fits within layout):
 *    <Suspense fallback={<ContentLoadingFallback />}>
 *
 * 3. Page-level Suspense (minimal loading):
 *    <Suspense fallback={<PageLoadingFallback />}>
 *
 * 4. Custom loading with message:
 *    <CustomLoadingFallback message="Loading data..." />
 *
 * WARNING: Never replace these with simple <div>Loading...</div> components
 * as it will break the layout structure with sidebar and navigation.
 */
