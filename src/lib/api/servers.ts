import { BASE_URL, fetchWithFallback } from "./common";

function buildQueryParams(params: Record<string, string | null | undefined>): URLSearchParams {
  const filtered = Object.entries(params).filter(
    ([, value]) => value != null && value !== ""
  );
  return new URLSearchParams(Object.fromEntries(filtered) as Record<string, string>);
}

export function fetchServers(
  page: number = 1,
  page_size: number = 10,
  category_id: string | null = null,
  searchTerm = "",
  developer: string | null = null
) {
  const params = buildQueryParams({
    page: page.toString(),
    page_size: page_size.toString(),
    category_id,
    search: searchTerm,
    developer,
  });

  const remoteUrl = `${BASE_URL}/servers/?${params.toString()}`;

  return fetchWithFallback(remoteUrl, (data) => data).catch(async () => {
    console.warn("Falling back to local /servers.json");
    const fallbackResponse = await fetch("/servers.json");
    const fallbackData = await fallbackResponse.json();
    return fallbackData;
  });
}