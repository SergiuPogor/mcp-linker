import { ServerList } from "@/components/server/ServerList";
import { useMcpServers } from "@/hooks/useMcpServers";
import { useDeferredValue, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

export default function SearchPage() {
  const { t } = useTranslation<"translation">();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const [page, setPage] = useState<number>(1);
  const [allServers, setAllServers] = useState<any[]>([]);

  const { data, isFetching } = useMcpServers({
    page,
    keyword: deferredSearchTerm,
  });

  useEffect(() => {
    setSearchTerm(query);
    setPage(1); // reset page on new search
  }, [query]);

  useEffect(() => {
    if (data?.servers) {
      setAllServers((prev) =>
        page === 1 ? data.servers : [...prev, ...data.servers],
      );
    }
  }, [data?.servers]);

  const servers = allServers;

  return (
    <div className="p-8">
      {isFetching ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <ServerList mcpServers={servers} />
          {data.hasNext && (
            <div className="mt-6 text-center">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => {
                  setPage((prev) => prev + 1);
                }}
              >
                {t("loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
