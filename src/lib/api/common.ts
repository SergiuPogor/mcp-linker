import { api } from "@/lib/axios";
import axios, { AxiosRequestConfig } from "axios";

// Fetch with timeout utility (using axios)
export async function fetchWithTimeout(
  resource: string,
  options: AxiosRequestConfig = {},
  timeout = 3000,
) {
  try {
    const response = await axios({
      url: resource,
      timeout,
      ...options,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function fetchWithFallback<T>(
  path: string,
  transform: (data: any) => T,
): Promise<T> {
  const remoteUrl = `${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await api.get(remoteUrl);
    return transform(response.data);
  } catch (err) {
    console.error(`Remote fetch failed (${remoteUrl}):`, err);
    throw new Error(`Remote fetch failed: ${(err as Error).message}`);
  }
}
