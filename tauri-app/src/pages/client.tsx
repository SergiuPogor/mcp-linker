import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { availableClients } from "@/constants/clients";
import { cn } from "@/lib/utils";
import { open } from "@tauri-apps/plugin-shell";
import { ExternalLink } from "lucide-react";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-3 rounded-lg border py-3 shadow-sm", // 缩小 gap 和 padding
        className
      )}
      {...props}
    />
  )
}

export default function ClientPage() {
  return (
    <div className="p-4 space-y-1">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">MCP Clients</h1>
        <p className="text-muted-foreground">
          Available Model Context Protocol clients for integration
        </p>
      </div>

      <div className="space-y-2">
        {availableClients.map((client) => (
          <Card
            key={client.value}
            className="rounded-xl hover:shadow-md transition-shadow"
          >
            <CardContent className="px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-2">{client.label}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {client.desc}
                        </p>
                    </div>
                    {client.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => open(client.url!)}
                        className="shrink-0"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Project
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}