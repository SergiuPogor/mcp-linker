import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

import { api } from "@/lib/axios";

type ServerItem = {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  banner_url?: string;
  category: string;
  rating: number;
  downloads: number;
};

type DiscoverResponse = {
  hero_servers: ServerItem[];
  recommended_servers: ServerItem[];
  sections: Record<string, ServerItem[]>;
};

export default function Home() {
  const [data, setData] = useState<DiscoverResponse | null>(null);

  useEffect(() => {
    api.get("/discover").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <img
          src={data.hero_servers[0]?.banner_url || "/placeholder.jpg"}
          alt="hero"
          width={1200}
          height={400}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Recommended */}
      <Section title="Recommended for You" servers={data.recommended_servers} />

      {/* Sections */}
      {Object.entries(data.sections).map(([title, servers]) => (
        <Section key={title} title={title} servers={servers} />
      ))}
    </div>
  );
}

function Section({ title, servers }: { title: string; servers: ServerItem[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {servers.map((server) => (
          <Card
            key={server.id}
            className="rounded-xl hover:shadow-md transition"
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <img
                src={server.icon_url}
                alt={server.name}
                width={64}
                height={64}
                className="mb-2 rounded-lg"
              />
              <h3 className="font-medium text-base">{server.name}</h3>
              <p className="text-sm text-gray-500">{server.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
