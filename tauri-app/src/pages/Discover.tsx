import { HeroBanner } from "@/components/banner";
import { ServerList } from "@/components/server";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";

const categories = [
  {
    key: "featured",
    label: "Recommended",
    icon: "🌟",
    description: "Editor picks and user favorites",
  },
  {
    key: "developer_tools",
    label: "Developer Tools",
    icon: "💻 ",
    description: "Prompt testing, context analysis",
  },
  {
    key: "must_have",
    label: "Must have",
    icon: "📌",
    description: "Must have",
  },
  {
    key: "Marketing",
    label: "AI for Marketing",
    icon: "📈",
    description: "Copywriting, A/B testing agents",
  },
  {
    key: "Browser Automation",
    label: "Automation",
    icon: "🤝",
    description: "HubSpot, lead nurturing AI",
  },
  {
    key: "Multimedia Process",
    label: "Media Workflows",
    icon: "🎬",
    description: "TTS, summarization, repurposing",
  },
  {
    key: "editors_choice",
    label: "Editors choice",
    icon: "✨",
    description: "Editors choice",
  },
  {
    key: "team",
    label: "Team",
    icon: "👥",
    description: "Team",
  },
];

export default function Discovery() {
  const [selectedTab, setSelectedTab] = useState<string>("featured");
  const navigate = useNavigate();

  const {
    data: discoverServers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["discover-servers", selectedTab],
    queryFn: async () => {
      const res = await api.get(`/servers/discover?tab=${selectedTab}`);
      return res.data;
    },
  });

  const handleFeatureClick = () => {
    setSelectedTab("featured");
  };

  return (
    <div className="p-8 space-y-4">
      <HeroBanner onFeatureClick={handleFeatureClick} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className="cursor-pointer rounded-lg border p-4 hover:bg-muted transition"
            onClick={() => setSelectedTab(cat.key)}
          >
            <div className="flex gap-2">
              <div className="text-2xl mb-2">{cat.icon}</div>
              <div className="font-semibold">{cat.label}</div>
            </div>
            <div className="text-sm text-muted-foreground">
              {cat.description}
            </div>
          </div>
        ))}
      </div>
      {/* Use navigate to programmatically go to the server detail page */}
      {import.meta.env.VITE_IS_DEV === "true" && (
        <div
          className="cursor-pointer text-blue-600 underline hover:text-blue-800"
          onClick={() => navigate("/servers/milisp/automatisch-mcp-server")}
        >
          milisp/automatisch-mcp-server
        </div>
      )}
      <div className="mt-8">
        {isLoading && <div>Loading...</div>}
        {error && <div>Error loading servers.</div>}
        {!isLoading && !error && (
          <ServerList mcpServers={discoverServers ?? []} />
        )}
      </div>
    </div>
  );
}
