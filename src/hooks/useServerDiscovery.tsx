import { useMcpServers } from "@/hooks/useMcpServers";
import { ServerType } from "@/types";
import { useEffect, useRef, useState } from "react";

export interface ServerDiscoveryOptions {
  initialSort?: string;
  initialDirection?: string;
}

export const useServerDiscovery = (options: ServerDiscoveryOptions = {}) => {
  const { initialSort = "github_stars", initialDirection = "desc" } = options;

  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);
  const [direction, setDirection] = useState(initialDirection);

  // Server data state
  const [allServers, setAllServers] = useState<ServerType[]>([]);

  // Scroll position tracking
  const scrollPositionRef = useRef(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch server data
  const { data, isLoading, isFetching } = useMcpServers({
    page,
    keyword: "",
    sort,
    direction,
  });

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

  // Reset to page 1 when sort options change
  const handleSortChange = (newSort: string, newDirection: string) => {
    setSort(newSort);
    setDirection(newDirection);
    setPage(1);
  };

  // Load more data
  const loadMore = () => {
    if (data?.hasNext && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  // Setup infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && data?.hasNext && !isFetching) {
          loadMore();
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

  return {
    allServers,
    isLoading,
    isFetching,
    loadMoreRef,
    hasNext: data?.hasNext,
    sort,
    direction,
    handleSortChange,
    loadMore,
    scrollToLoadMore: () => {
      loadMoreRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    },
  };
};
