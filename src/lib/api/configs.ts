import { fetchWithFallback } from "./common";

export function fetchServerConfig(server_id: number) {
  const path = `/server_configs/?server_id=${server_id}`;

  return fetchWithFallback(path, (data) => {
    // Check if the data already has the correct format
    if (Array.isArray(data)) {
      return data;
    }
    // Otherwise try to extract from server_id key
    return data[server_id] || [];
  });
}
