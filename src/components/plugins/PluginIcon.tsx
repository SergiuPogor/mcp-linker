import { pluginIcon } from "@/lib/plugins";
import { useRemoteIcon } from "@/lib/useRemoteIcon";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const TINTS = ["bg-blue-500/15 text-blue-600", "bg-emerald-500/15 text-emerald-600", "bg-amber-500/15 text-amber-600", "bg-violet-500/15 text-violet-600", "bg-rose-500/15 text-rose-600", "bg-cyan-500/15 text-cyan-600"];

/** The plugin's logo, or a tile with its initial when it has none. A logo named by a remote catalog is fetched by the app, not the webview, and kept on disk. */
export function PluginIcon({ name, icon, iconUrl, className }: { name: string; icon: string | null; iconUrl?: string | null; className?: string }) {
  const { data: local } = useQuery({ queryKey: ["plugin-icon", icon], queryFn: () => pluginIcon(icon as string), enabled: !!icon, staleTime: Number.POSITIVE_INFINITY });
  const remote = useRemoteIcon(icon ? null : iconUrl);
  const src = local ?? remote;
  if (src) return <img src={src} alt="" className={cn("size-10 shrink-0 rounded-lg border bg-background object-contain", className)} />;
  const tint = TINTS[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TINTS.length];
  return <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg text-lg font-semibold uppercase", tint, className)}>{name.charAt(0)}</div>;
}
