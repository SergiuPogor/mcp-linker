import { LocalTable } from "@/components/manage/LocalTable/index";
import { PersonalCloudTable } from "@/components/manage/PersonalCloudTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useTier } from "@/hooks/useTier";
import { useTabStore } from "@/stores/tabStore";
import { useViewStore } from "@/stores/viewStore";
import { getEncryptionKey } from "@/utils/encryption";
import { Cloud } from "lucide-react";

export function PersonalMcpSection() {
  const { personalTab, setPersonalTab } = useTabStore();
  const { isAuthenticated } = useAuth();
  const { navigate } = useViewStore();
  const { canUseCloudSync } = useTier();
  const encryptionKey = getEncryptionKey();

  return (
    <Tabs
      value={personalTab}
      onValueChange={setPersonalTab}
      className="h-full flex flex-col"
    >
      <TabsList className="grid grid-cols-2 gap-2 bg-secondary">
        <TabsTrigger value="personalLocal">Local</TabsTrigger>
        <TabsTrigger value="personalCloud">
          <Cloud />
          Cloud {!canUseCloudSync && "🔒"}
        </TabsTrigger>
      </TabsList>
      <TabsContent forceMount value="personalLocal" className="flex-1 min-h-0 data-[state=inactive]:hidden">
        <LocalTable />
      </TabsContent>
      <TabsContent value="personalCloud" className="flex-1 min-h-0">
        {isAuthenticated ? (
          <PersonalCloudTable />
        ) : !encryptionKey ? (
          <Button onClick={() => navigate("/settings")}>
            go to generate Encryption Key
          </Button>
        ) : (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            Please log in to view your personal cloud servers.
            <Button onClick={() => navigate("/auth")} className="mt-2">
              Login
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
