async function fetchWithFallback<T>(
  remoteUrl: string,
  localUrl: string,
  transform: (data: any) => T,
  fallbackTransform: (data: any) => T
): Promise<T> {
  try {
    const response = await fetch(remoteUrl);
    if (response.status === 404) throw new Error("Not Found");
    const data = await response.json();
    return transform(data);
  } catch (err) {
    console.warn(`Remote fetch failed (${remoteUrl}), using local:`, err);
    try {
      const localResponse = await fetch(localUrl, { cache: "no-store" });
      const localData = await localResponse.json();
      return fallbackTransform(localData);
    } catch (localErr) {
      console.error(`Local fetch failed (${localUrl}):`, localErr);
      throw new Error("Both remote and local fetch failed");
    }
  }
}

export function fetchServers(page = 1, pageSize = 10) {
  const remoteUrl = `http://localhost:8000/api/v1/servers?page=${page}&pageSize=${pageSize}`;
  const localUrl = "/servers.json";

  return fetchWithFallback(
    remoteUrl,
    localUrl,
    (data) => data,
    (localData) => ({
      ...localData,
      error: "Fetched from local fallback",
    })
  );
}

export function fetchServerConfig(server_id: string) {
  const remoteUrl = `http://localhost:8000/api/v1/servers/configs?server_id=${server_id}`;
  const localUrl = "/configs.json";

  return fetchWithFallback(
    remoteUrl,
    localUrl,
    (data) => data[server_id],
    (localData) => localData[server_id] || { error: "Config not found locally" }
  );
}