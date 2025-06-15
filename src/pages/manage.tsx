import { LocalTable } from "@/components/manage/LocalTable";
import { PersonalTable } from "@/components/manage/PersonalTable";
import { TeamTable } from "@/components/manage/TeamTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cloud } from "lucide-react";

export default function McpManage() {
  return (
    <div className="p-4 bg-background text-foreground">
      <Tabs defaultValue="local" className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            MCP Server Management
          </h1>
          <TabsList className="grid grid-cols-3 gap-2 bg-secondary">
            <TabsTrigger value="local">Local</TabsTrigger>
            <TabsTrigger value="personal">
              <Cloud />
              Personal
            </TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 min-h-0">
          <TabsContent value="local" className="flex-1 min-h-0">
            <LocalTable />
          </TabsContent>
          <TabsContent value="personal" className="flex-1 min-h-0">
            <PersonalTable />
          </TabsContent>
          <TabsContent value="team" className="flex-1 min-h-0">
            <TeamTable />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
