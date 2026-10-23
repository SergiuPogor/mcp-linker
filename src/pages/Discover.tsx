import { CollectionCarousel } from "@/components/collection/CollectionCarousel";
import { CATALOG_COLLECTIONS, CURATED_SERVER_IDS, FEATURED_SERVER_IDS } from "@/data/mcp-servers/catalog";
import { ServerList } from "@/components/server";
import { useMcpServers } from "@/hooks/useMcpServers";
import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useViewStore } from "@/stores/viewStore";
import Favorites from "./favorites";
import { SearchToggle } from "@/components/common/SearchToggle";
import { HomeNav } from "@/components/layout/HomeNav";
import { Cloud, Monitor, Star, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TransportFilter = "all" | "local" | "remote";

const TRANSPORT_FILTERS: { value: TransportFilter; label: string; icon?: LucideIcon }[] = [
  { value: "all", label: "All" },
  { value: "local", label: "Local (stdio)", icon: Monitor },
  { value: "remote", label: "Remote (HTTP/SSE)", icon: Cloud },
];

export default function Discovery() {
  const { t } = useTranslation();
  const { view, search, navigate } = useViewStore();
  const favorites = view === "favorites" || search.tab === "favorites";
  const [searchTerm, setSearchTerm] = useState("");
  const [transport, setTransport] = useState<TransportFilter>("all");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    servers,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMcpServers({ keyword: deferredSearchTerm });

  const filteredServers = useMemo(() => {
    const categorized = search.category ? servers.filter(server => server.tags?.includes(search.category)) : servers;
    if (transport === "all") return categorized;
    return categorized.filter((server) =>
      server.configs?.some((config) =>
        transport === "local"
          ? config.type === "stdio"
          : config.type === "http" || config.type === "sse",
      ),
    );
  }, [servers, transport, search.category]);

  const featuredServers = filteredServers.filter(server => FEATURED_SERVER_IDS.has(server.id));
  const registryServers = filteredServers.filter(server => !CURATED_SERVER_IDS.has(server.id));
  const categoryGroups = new Map<string, typeof filteredServers>();
  for (const server of filteredServers) {
    if (!CURATED_SERVER_IDS.has(server.id) || FEATURED_SERVER_IDS.has(server.id)) continue;
    const category = server.tags?.[0] ?? "Other";
    const group = categoryGroups.get(category) ?? [];
    group.push(server);
    categoryGroups.set(category, group);
  }

  // Filtering happens client-side, so a narrow filter can leave too few results
  // to fill the viewport and trigger the scroll sentinel. Keep pulling pages.
  useEffect(() => {
    if (
      !favorites &&
      transport !== "all" &&
      hasNextPage &&
      !isFetchingNextPage &&
      registryServers.length < 10
    ) {
      fetchNextPage();
    }
  }, [
    favorites,
    transport,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    registryServers.length,
  ]);

  // Infinite scrolling
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [favorites, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <HomeNav kind="mcps" scope="discover">
        <SearchToggle value={searchTerm} onChange={setSearchTerm} placeholder="Search for MCP servers..." />
        <Button
          variant={favorites ? "secondary" : "ghost"}
          size="icon"
          title={t("nav.favs")}
          aria-label={t("nav.favs")}
          aria-pressed={favorites}
          onClick={() => navigate(favorites ? "/discover" : "/discover?tab=favorites")}
        >
          <Star className={favorites ? "fill-yellow-400 text-yellow-500" : ""} />
        </Button>
        {!favorites && (
          <Tabs value={transport} onValueChange={value => setTransport(value as TransportFilter)}>
            <TabsList>
              {TRANSPORT_FILTERS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value} title={label} aria-label={label}>
                  {Icon ? <Icon aria-hidden="true" /> : label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </HomeNav>
      {favorites ? <Favorites embedded /> : <>
      {search.category && <div className="flex flex-wrap items-center gap-3 text-sm"><span>Category: {search.category}</span><button type="button" className="text-muted-foreground underline hover:text-foreground" onClick={() => navigate("/discover", { replace: true })}>Clear filter</button></div>}
      {!deferredSearchTerm && !search.category && transport === "all" && CATALOG_COLLECTIONS.length > 0 && (
        <CollectionCarousel collections={CATALOG_COLLECTIONS} />
      )}

      {featuredServers.length > 0 && (
        <section className="space-y-4" aria-labelledby="featured-servers-title">
          <h2 id="featured-servers-title" className="text-2xl font-bold">{t("featuredServers")}</h2>
          <ServerList mcpServers={featuredServers} />
        </section>
      )}

      {Array.from(categoryGroups, ([category, categoryServers]) => (
        <section key={category} className="space-y-4" aria-label={category}>
          <h2 className="text-2xl font-bold">{category}</h2>
          <ServerList mcpServers={categoryServers} />
        </section>
      ))}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {deferredSearchTerm
            ? `More results for "${deferredSearchTerm}"`
            : "More from MCP Registry"}
        </h2>

        {error && (
          <div className="text-center text-red-600 py-4">
            <p>Failed to load servers from the MCP registry. The local catalog is still available.</p>
            <p className="text-sm mt-1">{(error as Error).message}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">{t("loading") + "..."}</span>
          </div>
        ) : (
          <>
            {registryServers.length > 0 && <ServerList mcpServers={registryServers} />}

            {!error && registryServers.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <p className="text-lg">No registry servers found</p>
                {deferredSearchTerm && (
                  <p className="text-sm mt-2">Try a different search term</p>
                )}
              </div>
            )}

            {hasNextPage && (
              <div ref={loadMoreRef} className="p-2 flex justify-center h-10">
                {isFetchingNextPage && (
                  <div className="text-blue-600 dark:text-blue-400">
                    {t("loading") + "..."}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      </>}
    </div>
  );
}
