import { HeroBanner } from "@/components/banner";
import { ServerList } from "@/components/server/ServerList";
import { ServerTemplateDialog } from "@/components/server/dialog/ServerTemplateDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMcpServers } from "@/hooks/useMcpServers";
import { ServerType } from "@/types";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Discovery() {
  const { t } = useTranslation();
  const [isSell, setIsSell] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  // Record scroll position
  const scrollPositionRef = useRef(0);

  const { data, isLoading, isFetching } = useMcpServers({
    page,
    keyword: "",
  });

  const [allServers, setAllServers] = useState<ServerType[]>([]);

  // Save scroll position
  useEffect(() => {
    const saveScrollPosition = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener("scroll", saveScrollPosition);
    return () => window.removeEventListener("scroll", saveScrollPosition);
  }, []);

  // Process data updates and update server lists
  useEffect(() => {
    if (data?.servers) {
      setAllServers((prev) =>
        page === 1 ? data.servers : [...prev, ...data.servers],
      );
      if (page !== 1) {
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollPositionRef.current,
          });
        });
      }
    }
  }, [data?.servers, page]);

  // Infinite scrolling implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && data?.hasNext && !isFetching) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 },
    );

    const currentLoadMoreRef = loadMoreRef.current;

    if (currentLoadMoreRef) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
    };
  }, [data?.hasNext, isFetching]);

  const handleDialogIsSell = (isSell: boolean) => {
    setIsSell(isSell);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 sr-only">
        {t("nav.discover")}
      </h1>
      {/* Hero banner */}
      <HeroBanner />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("featuredServers")}
        </h2>
        <div className="flex gap-2">
          <Button onClick={() => handleDialogIsSell(false)}>
            {t("addCustomServer")}
          </Button>
          <Button onClick={() => handleDialogIsSell(true)}>
            {t("sellServer")}
          </Button>
        </div>
      </div>

      {/* Featured servers */}
      {allServers.length === 0 ? (
        <div className="p-8 text-gray-500 dark:text-gray-400">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : (
            t("noServerTip")
          )}
        </div>
      ) : (
        <>
          <ServerList mcpServers={allServers} />
          <div ref={loadMoreRef} className="p-2 flex justify-center h-32">
            {isFetching && (
              <div className="text-blue-600 dark:text-blue-400">
                {t("loading") + "..."}
              </div>
            )}
            {data?.hasNext && (
              <div className="text-blue-600 dark:text-blue-400">
                <button onClick={() => setPage((prev) => prev + 1)}>
                  {t("loadMore")}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Skip to bottom button */}
      <div className="fixed bottom-20 right-16 z-50">
        <button
          onClick={() => {
            loadMoreRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }}
          className="bg-transparent border border-blue-600 text-blue-600 px-2 py-2 rounded-full shadow-md hover:border-blue-700 dark:border-blue-500 dark:text-blue-500 dark:hover:border-blue-600"
        >
          <ChevronDown />
        </button>
      </div>

      <ServerTemplateDialog
        isOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isSell={isSell}
      />
    </div>
  );
}
