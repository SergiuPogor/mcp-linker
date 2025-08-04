import { HeroBanner } from "@/components/banner";
import { ServerList } from "@/components/server";
import { api } from "@/lib/api";
import { useMcpServers } from "@/hooks/useMcpServers";
import { useQuery } from "@tanstack/react-query";
import { ServerType } from "@/types";
import { CategoryType } from "@/types/cat";
import { Search } from "lucide-react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// Featured tabs - these use special logic in the API
const featuredTabs = [
  {
    key: "featured",
    label: "Recommended",
    icon: "🌟",
    description: "Editor picks and user favorites",
  },
  {
    key: "must_have",
    label: "Must Have",
    icon: "📌",
    description: "Essential MCP servers",
  },
  {
    key: "editors_choice",
    label: "Editors Choice",
    icon: "✨",
    description: "Curated by our editors",
  },
  {
    key: "team",
    label: "Team",
    icon: "👥",
    description: "Team collaboration tools",
  },
  {
    key: "developer_tools",
    label: "Developer Tools",
    icon: "💻",
    description: "Development and testing tools",
  },
];

export default function Discovery() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<string>("featured");

  // Categories state (for /categories page browsing)
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0); // 0 = All
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryServers, setCategoryServers] = useState<ServerType[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [searchPage, setSearchPage] = useState(1);
  const [searchServers, setSearchServers] = useState<ServerType[]>([]);

  // Featured/Special tabs query (uses /discover API)
  const {
    data: discoverServers,
    isLoading: featuredLoading,
    error: featuredError,
  } = useQuery({
    queryKey: ["discover-servers", selectedTab],
    queryFn: async () => {
      const res = await api.get(`/servers/discover?tab=${selectedTab}`);
      return res.data;
    },
    enabled: featuredTabs.some((tab) => tab.key === selectedTab),
  });

  // Category servers query
  const {
    data: categoryData,
    isLoading: categoryLoading,
    isFetching: categoryFetching,
  } = useMcpServers({
    page: categoryPage,
    category:
      selectedCategoryId === 0 ? undefined : selectedCategoryId.toString(),
  });

  // Search servers query
  const {
    data: searchData,
    isFetching: searchFetching,
    error: searchError,
  } = useMcpServers({
    page: searchPage,
    keyword: deferredSearchTerm,
  });

  const handleFeatureClick = () => {
    setSelectedTab("featured");
    // Scroll to top when clicking hero banner
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch categories when component mounts (only for categories tab)
  useEffect(() => {
    if (selectedTab === "categories") {
      fetch("/cats.json")
        .then((res) => res.json())
        .then(setCategories);
    }
  }, [selectedTab]);

  // Handle category data updates
  useEffect(() => {
    if (categoryData?.servers) {
      setCategoryServers((prev) => {
        return categoryPage === 1
          ? categoryData.servers
          : [...prev, ...categoryData.servers];
      });
    }
  }, [categoryData?.servers, categoryPage]);

  // Reset servers when category changes
  useEffect(() => {
    setCategoryPage(1);
    setCategoryServers([]);
  }, [selectedCategoryId]);

  // Handle search data updates
  useEffect(() => {
    if (searchData?.servers) {
      setSearchServers((prev) =>
        searchPage === 1
          ? searchData.servers
          : [...prev, ...searchData.servers],
      );
    }
  }, [searchData?.servers, searchPage]);

  // Reset search when switching tabs
  useEffect(() => {
    if (selectedTab !== "search") {
      setSearchTerm("");
      setSearchPage(1);
      setSearchServers([]);
    }
  }, [selectedTab]);

  // Reset category when switching tabs
  useEffect(() => {
    if (selectedTab !== "categories") {
      setSelectedCategoryId(0);
      setCategoryPage(1);
      setCategoryServers([]);
    }
  }, [selectedTab]);

  // Save scroll position for categories
  useEffect(() => {
    if (selectedTab !== "categories") return;

    const saveScrollPosition = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener("scroll", saveScrollPosition);
    return () => window.removeEventListener("scroll", saveScrollPosition);
  }, [selectedTab]);

  // Infinite scrolling for categories
  useEffect(() => {
    if (selectedTab !== "categories") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          categoryData?.hasNext &&
          !categoryFetching
        ) {
          setCategoryPage((prev) => prev + 1);
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
  }, [categoryData?.hasNext, categoryFetching, selectedTab]);

  // Category handlers
  const handleCategoryFilter = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setCategoryPage(1);
    setCategoryServers([]);
  };

  // Search handlers
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchPage(1);
    setSearchServers([]);
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  const renderFeaturedContent = () => {
    // Show featured page with recommended servers + quick access
    if (selectedTab === "featured") {
      return (
        <div className="space-y-8">
          <HeroBanner onFeatureClick={handleFeatureClick} />

          {/* Recommended Servers Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌟</span>
              <h2 className="text-2xl font-bold">Recommended Servers</h2>
            </div>

            {featuredLoading && (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading recommended servers...</span>
              </div>
            )}

            {featuredError && (
              <div className="text-center text-red-600 py-4">
                <p>Error loading recommended servers.</p>
              </div>
            )}

            {!featuredLoading && !featuredError && (
              <ServerList mcpServers={discoverServers ?? []} />
            )}
          </div>
        </div>
      );
    }

    // Show servers for specific featured tabs
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {featuredTabs.find((tab) => tab.key === selectedTab)?.label}
        </h2>
        {featuredLoading && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading servers...</span>
          </div>
        )}
        {featuredError && (
          <div className="text-center text-red-600 py-4">
            Error loading servers.
          </div>
        )}
        {!featuredLoading && !featuredError && (
          <ServerList mcpServers={discoverServers ?? []} />
        )}
      </div>
    );
  };

  const renderCategoriesContent = () => {
    if (!categories.length)
      return <div className="p-4">Loading categories...</div>;

    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId,
    );

    return (
      <div className="space-y-6">
        {/* Category Filter Bar */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {selectedCategoryId === 0
              ? "All Servers"
              : selectedCategory?.name || "All Servers"}
          </h2>

          {/* Horizontal scrollable category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => handleCategoryFilter(0)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategoryId === 0
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              🌐 All
            </button>
            {categories.map((category: CategoryType) => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategoryId === category.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Server List */}
        <div>
          {categoryLoading && categoryServers.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading servers...</span>
            </div>
          ) : (
            <>
              <ServerList mcpServers={categoryServers} />

              {categoryData?.hasNext && (
                <div ref={loadMoreRef} className="p-2 flex justify-center h-10">
                  {categoryFetching && (
                    <div className="text-blue-600 dark:text-blue-400">
                      {t("loading") + "..."}
                    </div>
                  )}
                </div>
              )}

              {/* Show servers count */}
              {categoryServers.length > 0 && (
                <div className="text-center text-gray-500 mt-4">
                  Showing {categoryServers.length} server
                  {categoryServers.length !== 1 ? "s" : ""}
                  {categoryData?.hasNext && " (scroll for more)"}
                </div>
              )}

              {/* Empty state */}
              {!categoryLoading && categoryServers.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p className="text-lg">No servers found in this category</p>
                  <p className="text-sm mt-2">
                    Try selecting a different category
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSearchContent = () => {
    if (searchError) {
      return (
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Search Error</h2>
          <p>Failed to load search results. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {searchFetching && searchServers.length === 0 && deferredSearchTerm && (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Searching...</span>
          </div>
        )}

        {!searchFetching &&
          searchServers.length === 0 &&
          deferredSearchTerm && (
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
              <p>
                No servers found for "{deferredSearchTerm}". Try a different
                search term.
              </p>
            </div>
          )}

        {deferredSearchTerm && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Search Results for "{deferredSearchTerm}"
            </h1>
            <p className="text-gray-600 mt-1">
              {searchServers.length} server
              {searchServers.length !== 1 ? "s" : ""} found
            </p>
          </div>
        )}

        {searchServers.length > 0 && <ServerList mcpServers={searchServers} />}

        {searchData?.hasNext && (
          <div className="text-center">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
              onClick={() => setSearchPage((prev) => prev + 1)}
              disabled={searchFetching}
            >
              {searchFetching ? "Loading..." : t("loadMore")}
            </button>
          </div>
        )}

        {searchFetching && searchServers.length > 0 && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2">Loading more...</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-4">
      {/* Search Bar - Always visible at top */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value && selectedTab !== "search") {
                  setSelectedTab("search");
                }
              }}
              placeholder="Search for MCP servers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
        </form>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {featuredTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-md transition whitespace-nowrap ${
              selectedTab === tab.key
                ? "bg-white dark:bg-gray-700 shadow-sm"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <button
          onClick={() => handleTabChange("categories")}
          className={`px-4 py-2 rounded-md transition ${
            selectedTab === "categories"
              ? "bg-white dark:bg-gray-700 shadow-sm"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          📂 Categories
        </button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {featuredTabs.some((tab) => tab.key === selectedTab) &&
          renderFeaturedContent()}
        {selectedTab === "categories" && renderCategoriesContent()}
        {selectedTab === "search" && renderSearchContent()}
      </div>
    </div>
  );
}
