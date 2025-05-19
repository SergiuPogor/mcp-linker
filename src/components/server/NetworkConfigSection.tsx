import { LabeledInput } from "../shared/LabeledInput";
import { HeaderEditor } from "./HeaderEditor";
import type { ServerConfig } from "@/types";

interface NetworkConfigSectionProps {
  config: ServerConfig;
  handleUrl: (value: string) => void;
  handletHeaderChange: (key: string, value: string) => void;
  headerValues: Record<string, string>;
  setHeaderValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const NetworkConfigSection = ({
  config,
  handleUrl,
  handletHeaderChange,
  headerValues,
  setHeaderValues,
}: NetworkConfigSectionProps) => {
  return (
    <div>
      <LabeledInput
        label="Url"
        value={"url" in config ? config.url : ""}
        onChange={handleUrl}
      />

      <HeaderEditor
        header={"headers" in config ? config.headers || {} : {}}
        headerValues={headerValues}
        setHeaderValues={setHeaderValues}
        onHeaderChange={handletHeaderChange}
      />
    </div>
  );
};
