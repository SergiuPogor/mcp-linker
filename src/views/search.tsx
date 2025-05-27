import { ServerList } from "@/components/server";
import { useMcpServers } from "@/hooks/useMcpServers";
import { useDeferredValue, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

export default function SearchPage() {
  const { t } = useTranslation<"translation">();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [searchTerm, setSearchTerm] = useState(query);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const [page, setPage] = useState<number>(1);
  const [allServers, setAllServers] = useState<any[]>([]);

  const { data, isFetching, error } = useMcpServers({
    page,
    keyword: deferredSearchTerm,
  });

  // Debug logging to help identify issues
  console.log("Search debug:", {
    query,
    searchTerm,
    deferredSearchTerm,
    page,
    data,
    isFetching,
    error,
    allServers,
  });

  useEffect(() => {
    setSearchTerm(query);
    setPage(1); // Reset page on new search
    setAllServers([]); // Clear previous results when search term changes
  }, [query]);

  useEffect(() => {
    if (data?.servers) {
      setAllServers((prev) =>
        page === 1 ? data.servers : [...prev, ...data.servers],
      );
    }
  }, [data?.servers, page]);

  const servers = allServers;

  // Handle error state
  if (error) {
    return (
      <div className="p-8">
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
      </div>
    );
  }

  // Handle loading state
  if (isFetching && servers.length === 0) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Searching...</span>
        </div>
      </div>
    );
  }

  // Handle empty results
  if (!isFetching && servers.length === 0 && query) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-500">
          <h2 className="text-xl font-semibold mb-2">No Results Found</h2>
          <p>No servers found for "{query}". Try a different search term.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {query && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Search Results for "{query}"</h1>
          <p className="text-gray-600 mt-1">
            {servers.length} server{servers.length !== 1 ? "s" : ""} found
          </p>
        </div>
      )}

      <ServerList mcpServers={servers} />

      {/* Load more button */}
      {data?.hasNext && (
        <div className="mt-6 text-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            onClick={() => {
              setPage((prev) => prev + 1);
            }}
            disabled={isFetching}
          >
            {isFetching ? "Loading..." : t("loadMore")}
          </button>
        </div>
      )}

      {/* Additional loading indicator for pagination */}
      {isFetching && servers.length > 0 && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading more...</span>
        </div>
      )}
    </div>
  );
}
