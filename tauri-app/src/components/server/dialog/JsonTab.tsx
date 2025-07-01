import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useServerTemplateLogic } from "./useServerTemplateLogic";

interface JsonTabProps {
  logic: ReturnType<typeof useServerTemplateLogic>;
}

const JsonTab: React.FC<JsonTabProps> = ({ logic }) => (
  <TabsContent value="json">
    <div className="flex gap-2 items-start">
      <Textarea
        className="flex-1"
        value={logic.jsonText}
        onChange={(e) => logic.setJsonText(e.target.value)}
        onBlur={logic.handleJsonBlur}
        rows={12}
      />
      <Button onClick={logic.handlePasteJson}>Paste</Button>
    </div>
  </TabsContent>
);

export default JsonTab;
