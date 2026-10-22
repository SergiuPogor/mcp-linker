import { cn } from "@/lib/utils";
import type { KeyboardEvent, ReactNode } from "react";

/** One skill or plugin in a list: icon tile, name, two lines of description, and an action on the right. */
export function CatalogCard({
  icon,
  title,
  description,
  badge,
  leading,
  action,
  onOpen,
  className,
}: {
  icon: ReactNode;
  title: string;
  description?: string | null;
  badge?: ReactNode;
  /** Sits before the icon, e.g. a selection checkbox. */
  leading?: ReactNode;
  action?: ReactNode;
  onOpen?: () => void;
  className?: string;
}) {
  const stop = { onClick: (event: { stopPropagation: () => void }) => event.stopPropagation(), onKeyDown: (event: KeyboardEvent) => event.stopPropagation() };
  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      className={cn("flex min-w-0 items-center gap-3 rounded-xl border bg-card p-3 transition-colors", onOpen && "cursor-pointer hover:border-foreground/20 hover:bg-muted/40", className)}
      onClick={onOpen}
      onKeyDown={event => event.key === "Enter" && onOpen?.()}
    >
      {leading && <div {...stop}>{leading}</div>}
      {icon}
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-medium">
          <span className="truncate" title={title}>{title}</span>
          {badge}
        </p>
        {description && <p className="line-clamp-2 text-sm leading-snug text-muted-foreground" title={description}>{description}</p>}
      </div>
      {action && <div className="shrink-0" {...stop}>{action}</div>}
    </div>
  );
}
