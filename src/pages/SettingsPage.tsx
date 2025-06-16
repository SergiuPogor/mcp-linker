import EncryptionKeyCard from "@/components/settings/EncryptionKeyCard";
import SecurityNoticeCard from "@/components/settings/SecurityNoticeCard";
import { useTeam } from "@/hooks/useTeam";
import { useEffect, useState } from "react";

interface Key {
  id: string;
  name: string;
  type: "personal" | "team";
}

export default function SettingPage() {
  const { teams, fetchMyTeams } = useTeam();
  const [keys, setKeys] = useState<Key[]>([]);
  useEffect(() => {
    fetchMyTeams();
  }, []);
  useEffect(() => {
    console.log("teams from useTeam():", teams);

    const updatedKeys: Key[] = [
      { id: "personal", name: "Personal", type: "personal" },
      ...teams.map((team) => ({
        id: team.id,
        name: team.name,
        type: "team" as const,
      })),
    ];

    console.log("updated keys:", updatedKeys);
    setKeys(updatedKeys);
  }, [teams]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your encryption keys and security settings
        </p>
      </div>

      <div className="space-y-4">
        {keys.map((key) => (
          <EncryptionKeyCard
            key={key.id}
            keyId={key.id}
            keyName={key.name}
            type={key.type}
          />
        ))}
      </div>

      {/* Security Notice */}
      <SecurityNoticeCard />
    </div>
  );
}
