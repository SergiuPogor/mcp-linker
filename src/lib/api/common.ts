export const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000/api/v1";

export async function fetchWithFallback<T>(
    remoteUrl: string,
    transform: (data: any) => T
  ): Promise<T> {
    try {
      const response = await fetch(remoteUrl);
      if (response.status === 404) throw new Error("Not Found");
      const data = await response.json();
      return transform(data);
    } catch (err) {
      console.error(`Remote fetch failed (${remoteUrl}):`, err);
      throw new Error("Remote fetch failed");
    }
  }