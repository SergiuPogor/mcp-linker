import { HeroBanner } from "@/components/banner";
import { ServerList } from "@/components/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const tabs = [
  { key: "is_official", label: "Official Servers" },
  { key: "github_stars", label: "Most GitHub Stars" },
  { key: "must_have", label: "Must Have" },
  { key: "featured", label: "Featured" },
  { key: "best_new", label: "Best New" },
  { key: "editors_choice", label: "Editors Choice" },
  { key: "developer_tools", label: "Developer Tools" },
];

export default function Discovery() {
  const [selectedTab, setSelectedTab] = useState<string>("is_official");

  const { data: discoverServers, isLoading, error } = useQuery({
    queryKey: ["discover-servers", selectedTab],
    queryFn: async () => {
      const res = await api.get(`/servers/discover?tab=${selectedTab}`);
      return res.data;
    },
  });

  return (
    <div className="p-8 space-y-4">
      <HeroBanner />
      <Tabs defaultValue="is_official" onValueChange={(val) => setSelectedTab(val)}>
        <TabsList className="mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}
            className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted data-[state=active]:bg-primary data-[state=active]:text-white"
>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={selectedTab}>
          {isLoading && <div>Loading...</div>}
          {error && <div>Error loading servers.</div>}
          {!isLoading && !error && <ServerList mcpServers={discoverServers ?? []} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}