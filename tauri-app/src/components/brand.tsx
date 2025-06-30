import { Button } from "@/components/ui/button";

export const Brand = ({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsCollapsed(!isCollapsed)}
      className="h-8 w-8"
    >
      {isCollapsed ? "→" : "←"}
    </Button>
  );
};
