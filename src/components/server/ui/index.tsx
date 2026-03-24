import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { openUrl } from "@/utils/urlHelper";

export function ServerMeta({
  icon: Icon,
  value,
}: {
  icon: React.ElementType;
  value?: string | number;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center space-x-2">
      <Icon size={16} />
      <span>{typeof value === "number" ? value.toLocaleString() : value}</span>
    </div>
  );
}

export function ServerBadge({ isOfficial }: { isOfficial: boolean }) {
  return (
    <Badge variant={isOfficial ? "secondary" : "outline"} className="uppercase">
      {isOfficial ? "Official" : "Community"}
    </Badge>
  );
}

export function ServerActions({
  source,
  onGetClick,
}: {
  source: string;
  onGetClick: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => openUrl(source)}>
        View Source
      </Button>
      <Button variant="outline" onClick={onGetClick}>
        get
      </Button>
    </div>
  );
}
