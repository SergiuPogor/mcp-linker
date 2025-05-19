import { fetchServers } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useMcpServers({
  page = 1,
  pageSize = 20,
  category = null,
  keyword = "",
}: {
  page?: number;
  pageSize?: number;
  category?: string | null;
  keyword?: string;
}) {
  return useQuery({
    queryKey: ["servers", page, pageSize, category, keyword],
    queryFn: () => fetchServers(page, pageSize, category, keyword),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}