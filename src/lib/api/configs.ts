import { BASE_URL, fetchWithFallback } from "./common";




export function fetchServerConfig(server_id: string) {
  const remoteUrl = `${BASE_URL}/configs/?server_id=${server_id}`;

  return fetchWithFallback(remoteUrl, (data) => {
    // Check if the data already has the correct format
    if (Array.isArray(data)) {
      return data;
    }
    // Otherwise try to extract from server_id key
    return data[server_id] || [];
  });
}
