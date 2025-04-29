export async function fetchServers() {
  try {
    // 1. Try fetching from remote
    const response = await fetch(
      "https://milisp.github.io/mcp-linker/servers.json",
      { cache: "no-store" },
    );
    const remoteData = await response.json();
    return remoteData; // returns { version, servers }
  } catch (error) {
    console.error(
      "Error fetching remote servers, trying local fallback:",
      error,
    );
    try {
      // 2. Fallback: fetch from local /public/servers.json
      const localResponse = await fetch("/servers.json", { cache: "no-store" });
      const localData = await localResponse.json();
      return localData;
    } catch (localError) {
      console.error("Error fetching local servers.json:", localError);
      return {
        version: "unknown",
        servers: [],
      };
    }
  }
}
