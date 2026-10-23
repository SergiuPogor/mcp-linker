import { useQuery } from "@tanstack/react-query";
import { remoteIcon } from "./plugins";

/** A logo the app downloaded and cached for `url`, as a data: URL; undefined until then, and for good when it isn't from a listed host. */
export const useRemoteIcon = (url: string | null | undefined) =>
  useQuery({ queryKey: ["remote-icon", url], queryFn: () => remoteIcon(url as string), enabled: !!url, staleTime: Number.POSITIVE_INFINITY, retry: false }).data ?? undefined;
