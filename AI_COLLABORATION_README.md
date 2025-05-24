# AI Collaboration Guidelines for MCP Linker

## 🚨 CRITICAL: Loading Components

**NEVER replace loading components with simple `<div>Loading...</div>`**

This application has a complex layout structure with:
- Fixed sidebar on the left
- Navigation bar at the top  
- Scrollable content area

### ✅ CORRECT Loading Usage

```tsx
// App-level loading (preserves full layout)
<Suspense fallback={<AppLoadingFallback />}>

// Content-level loading (fits within existing layout)
<Suspense fallback={<ContentLoadingFallback />}>

// Page-level loading (minimal context)
<Suspense fallback={<PageLoadingFallback />}>

// Custom loading with message
<CustomLoadingFallback message="Loading data..." />
```

### ❌ INCORRECT - Will Break Layout

```tsx
// DON'T DO THIS - breaks layout structure
<Suspense fallback={<div>Loading...</div>}>

// DON'T DO THIS - missing layout preservation
<Suspense fallback={<span>Loading...</span>}>
```

## Loading System Files

- `/src/components/LoadingSkeleton.tsx` - Skeleton components with proper layout
- `/src/components/LoadingConfig.tsx` - Centralized loading configuration
- `/src/components/ContentArea.tsx` - Uses ContentLoadingFallback
- `/src/App.tsx` - Uses AppLoadingFallback

## Layout Structure

```
┌─────────────────────────────────────────┐
│ App.tsx (AppLoadingFallback)            │
├─────────┬───────────────────────────────┤
│ Sidebar │ Navigation Bar                │
│         ├───────────────────────────────┤
│         │ ContentArea                   │
│         │ (ContentLoadingFallback)      │
│         │                               │
│         │   Routes/Pages                │
│         │   (PageLoadingFallback)       │
└─────────┴───────────────────────────────┘
```

## Key Files (DO NOT MODIFY WITHOUT UNDERSTANDING)

- `src/components/Layout.tsx` - Main layout with sidebar and navigation
- `src/components/ContentArea.tsx` - Lazy loading content area
- `src/components/LoadingConfig.tsx` - Loading configuration system
- `src/App.tsx` - Root app component

## Environment

- `.env` file exists - DO NOT MODIFY unless specifically requested
- Project is committed to git
- Uses Tauri for desktop app functionality

## When Working with AI

1. Always check existing loading implementations before making changes
2. Use the centralized LoadingConfig.tsx for all loading states
3. Test that sidebar and navigation remain visible during loading
4. Preserve the existing layout structure
5. Reference this README when unsure about loading implementations

## Common Issues to Avoid

- Replacing structured loading with simple divs
- Breaking the flex layout structure
- Making loading states that don't fit the existing design
- Modifying the sidebar or navigation visibility during loading states
