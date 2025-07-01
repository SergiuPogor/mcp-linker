import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface GithubJsonImportPanelProps {
  githubJsonBlocks: { obj: any; serverName: string }[];
  onImport: (obj: any, serverName: string) => void;
}

// Panel to render imported JSON blocks from GitHub README
export const GithubJsonImportPanel: React.FC<GithubJsonImportPanelProps> = ({
  githubJsonBlocks,
  onImport,
}) => {
  if (!githubJsonBlocks || githubJsonBlocks.length === 0) {
    return <Textarea readOnly />;
  }
  return (
    <div className="mt-3 flex flex-col gap-3">
      {githubJsonBlocks.map((item, idx) => (
        <div key={idx}>
          <div className="font-medium mb-1 flex items-center gap-2">
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => onImport(item.obj, item.serverName)}
            >
              Import
            </Button>
          </div>
          <Textarea
            value={JSON.stringify({[item.serverName]: item.obj}, null, 2)}
            readOnly
            rows={8}
          />
        </div>
      ))}
    </div>
  );
};
