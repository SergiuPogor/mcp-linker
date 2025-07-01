import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { readText } from '@tauri-apps/plugin-clipboard-manager';
import { GithubJsonImportPanel } from "./GithubJsonImportPanel";
import { useServerTemplateLogic } from "./useServerTemplateLogic";

interface UrlTabProps {
  logic: ReturnType<typeof useServerTemplateLogic>;
  onImportGithubBlock: (obj: any, serverName: string) => void;
}

const UrlTab: React.FC<UrlTabProps> = ({ logic, onImportGithubBlock }) => (
  <TabsContent value="url">
    <Input
      placeholder="https://github.com/owner/repo"
      value={logic.githubUrl}
      onChange={(e) => logic.setGithubUrl(e.target.value)}
      disabled={logic.loading}
    />
    <Button
      onClick={async() => {
        logic.setGithubUrl(await readText())
      }}
      className="mr-2"
    >
      Paste url
    </Button>
    <Button
      onClick={logic.handleLoadFromGithub}
      disabled={logic.loading || !logic.githubUrl}
    >
      {logic.loading ? "Loading..." : "Load from GitHub"}
    </Button>
    <GithubJsonImportPanel
      githubJsonBlocks={logic.githubJsonBlocks}
      onImport={onImportGithubBlock}
    />
  </TabsContent>
);

export default UrlTab;
