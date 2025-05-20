import { api } from "@/lib/axios";

function buildQueryParams(
  params: Record<string, string | null | undefined>,
): URLSearchParams {
  // Filter out null and empty string values to avoid invalid query params
  const filtered = Object.entries(params).filter(
    ([, value]) => value != null && value !== "",
  );
  return new URLSearchParams(
    Object.fromEntries(filtered) as Record<string, string>,
  );
}

export async function fetchServers(
  page: number = 1,
  page_size: number = 10,
  category_id: string | null = null,
  searchTerm = "",
  developer: string | null = null,
) {
  const params = buildQueryParams({
    page: page.toString(),
    page_size: page_size.toString(),
    category_id,
    search: searchTerm,
    developer,
  });

  const path = `/servers/?${params.toString()}`;

  try {
    // Try API with timeout (3s)
    const response = await api.get(path, { timeout: 3000 });
    return response.data;
  } catch (err) {
    console.warn("Falling back to local /servers.json", err);
    const fallbackResponse = await fetch("/servers.json");
    const fallbackData = await fallbackResponse.json();
    return fallbackData;
  }
}

export async function updateServerStats(path: string, serverId: number) {
  try {
    const response = await api.post(`/servers/${serverId}${path}`);
    console.log("Stats updated:", response.data);
  } catch (error) {
    console.error("Error updating server stats:", error);
  }
}

export async function incrementViews(serverId: number) {
  await updateServerStats("/views", serverId);
}

export async function incrementDownloads(serverId: number) {
  await updateServerStats("/downloads", serverId);
}
