import { fetchServers } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useMcpServers({
  page = 1,
  pageSize = 20,
  category = null,
  keyword = "",
  sort = "github_stars",
  direction = "desc",
}: {
  page?: number;
  pageSize?: number;
  category?: string | null;
  keyword?: string;
  sort?: string;
  direction?: string;
}) {
  return useQuery({
    queryKey: ["servers", page, pageSize, category, keyword, sort, direction],
    queryFn: () =>
      fetchServers(page, pageSize, category, keyword, sort, direction),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
