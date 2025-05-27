import { ServerList } from "@/components/server";
import { useMcpServers } from "@/hooks/useMcpServers";
import { ServerType } from "@/types";
import { CategoryType } from "@/types/cat";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Categories() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [allServers, setAllServers] = useState<ServerType[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Record scroll position
  const scrollPositionRef = useRef(0);

  // Fetch categories when component mounts
  useEffect(() => {
    fetch("/cats.json")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  // Fetch servers for the selected category
  const { data, isLoading, isFetching } = useMcpServers({
    page,
    category: selectedCategory?.id.toString(),
  });

  // Save scroll position
  useEffect(() => {
    const saveScrollPosition = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener("scroll", saveScrollPosition);
    return () => window.removeEventListener("scroll", saveScrollPosition);
  }, []);

  // Handle data updates, update server list
  useEffect(() => {
    if (data?.servers) {
      setAllServers((prev) => {
        return page === 1 ? data.servers : [...prev, ...data.servers];
      });

      // After data update, restore scroll position only when loading more (page !== 1)
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
    if (!selectedCategory) return; // Only enable when a category is selected

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
  }, [data?.hasNext, isFetching, selectedCategory]);

  // Handle back button click
  const handleBackClick = () => {
    setSelectedCategory(null);
    setPage(1); // Reset page when going back
    setAllServers([]); // Clear server list
  };

  // Handle category selection
  const handleCategoryClick = (category: CategoryType) => {
    setSelectedCategory(category);
    setPage(1); // Reset page when changing category
    setAllServers([]); // Clear previous server list
  };

  if (!categories.length)
    return <div className="p-4">Loading categories...</div>;

  return (
    <div className="p-4">
      {selectedCategory ? (
        // Show servers for selected category with back button
        <div>
          <div className="flex items-center mb-4">
            <button
              onClick={handleBackClick}
              className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>{t("back")}</span>
            </button>
            <h2 className="text-xl font-semibold">{selectedCategory.name}</h2>
          </div>

          {isLoading && allServers.length === 0 ? (
            <div className="p-4">Loading servers...</div>
          ) : (
            <>
              <ServerList mcpServers={allServers} />

              {data?.hasNext && (
                <div ref={loadMoreRef} className="p-2 flex justify-center h-10">
                  {isFetching && (
                    <div className="text-blue-600 dark:text-blue-400">
                      {t("loading") + "..."}
                    </div>
                  )}
                </div>
              )}

              {/* Skip to bottom button */}
              <div className="fixed bottom-20 right-4 z-50">
                <button
                  onClick={() => {
                    loadMoreRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }}
                  className="bg-transparent border border-blue-600 text-blue-600 px-4 py-2 rounded-full shadow-md hover:border-blue-700 dark:border-blue-500 dark:text-blue-500 dark:hover:border-blue-600"
                >
                  <ChevronDown />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        // Show categories grid
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category: CategoryType) => (
            <div
              key={category.id}
              className="border rounded p-4 shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleCategoryClick(category)}
            >
              <h2 className="text-lg font-semibold">{category.name}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
