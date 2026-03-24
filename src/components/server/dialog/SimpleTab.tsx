import { TabsContent } from "@/components/ui/tabs";
import { ServerTemplateForm } from "../form/ServerTemplateForm";
import { useServerTemplateLogic } from "./useServerTemplateLogic";

interface SimpleTabProps {
  logic: ReturnType<typeof useServerTemplateLogic>;
}

const SimpleTab: React.FC<SimpleTabProps> = ({ logic }) => (
  <TabsContent value="simple">
    <ServerTemplateForm
      serverName={logic.serverName}
      setServerName={logic.setServerName}
      serverType={logic.serverType}
      setServerType={logic.setServerType}
      config={logic.config}
      handleArgsChange={logic.handleArgsChange}
      handleCommandChange={logic.handleCommandChange}
      handleUrl={logic.handleUrl}
      handleEnvChange={logic.handleEnvChange}
      handletHeaderChange={logic.handletHeaderChange}
      envValues={logic.envValues}
      setEnvValues={logic.setEnvValues}
      headerValues={logic.headerValues}
      setHeaderValues={logic.setHeaderValues}
    />
  </TabsContent>
);

export default SimpleTab;
