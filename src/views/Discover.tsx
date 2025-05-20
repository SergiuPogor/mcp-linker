import { HeroBanner } from "@/components/banner";
import { ServerTemplateDialog } from "@/components/server/dialog/ServerTemplateDialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Import refactored components
import { DiscoveryHeader } from "@/components/discovery/DiscoveryHeader";
import { InfiniteScrollServers } from "@/components/discovery/InfiniteScrollServers";
import { ScrollToBottomButton } from "@/components/discovery/ScrollToBottomButton";
import { useServerDiscovery } from "@/hooks/useServerDiscovery";

export default function Discovery() {
  const { t } = useTranslation();
  const [isSell, setIsSell] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use our custom hook for server discovery logic
  const {
    allServers,
    isLoading,
    isFetching,
    loadMoreRef,
    hasNext,
    sort,
    direction,
    handleSortChange,
    loadMore,
    scrollToLoadMore,
  } = useServerDiscovery();

  // Dialog handlers
  const handleAddServer = () => {
    setIsSell(false);
    setIsDialogOpen(true);
  };

  const handleSellServer = () => {
    setIsSell(true);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 sr-only">
        {t("nav.discover")}
      </h1>

      {/* Hero banner */}
      <HeroBanner />

      {/* Header with sorting and action buttons */}
      <DiscoveryHeader
        sort={sort}
        direction={direction}
        onSortChange={handleSortChange}
        onAddServer={handleAddServer}
        onSellServer={handleSellServer}
      />

      {/* Server list with infinite scrolling */}
      <InfiniteScrollServers
        servers={allServers}
        isLoading={isLoading}
        isFetching={isFetching}
        hasNext={hasNext}
        loadMoreRef={loadMoreRef}
        onLoadMore={loadMore}
      />

      {/* Scroll to bottom button */}
      <ScrollToBottomButton onClick={scrollToLoadMore} />

      {/* Server template dialog */}
      <ServerTemplateDialog
        isOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isSell={isSell}
      />
    </div>
  );
}
