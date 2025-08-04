import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

// DxtCard component to display manifest info
export function DxtCard({ dxt }: { dxt: any }) {
  // Always treat dxt.tools as an array
  const toolsArray = Array.isArray(dxt.tools) ? dxt.tools : [];
  const showTools = toolsArray.slice(0, 3);
  const hasMore = toolsArray.length > 3;
  const navigate = useNavigate();

  // Extract user/repo from manifest - should match backend storage structure
  const getUserRepo = () => {
    // Backend stores using author.name and name fields
    const user = dxt.author?.name || "unknown";
    const repo = dxt.name || "unknown";

    return { user, repo };
  };

  const { user, repo } = getUserRepo();

  return (
    <Card
      className="w-full h-full flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => {
        console.log("go to ", user, repo);
        navigate(`/dxt/${user}/${repo}`);
      }}
    >
      <CardContent className="flex flex-col flex-1">
        <div className="flex gap-2 items-start">
          <img src={dxt.icon} alt="icon" className="w-10 h-10 rounded" />
          <div className="flex flex-col flex-1">
            <span className="font-bold text-lg">{dxt.display_name}</span>
            <div className="text-sm text-muted-foreground">
              {dxt.author?.name}
            </div>
          </div>
          <ChevronRight className="flex-shrink-0" />
        </div>
        <CardDescription className="line-clamp-2">
          {dxt.description}
        </CardDescription>
        {/* Tools */}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {showTools.map((tool: any) => (
            <span
              key={tool.name}
              className="bg-muted px-2 py-0.5 rounded text-xs font-medium"
            >
              {tool.name}
            </span>
          ))}
          {hasMore && (
            <span className="text-xs text-muted-foreground">more</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { UserConfigForm } from "./user-config/UserConfigForm";
