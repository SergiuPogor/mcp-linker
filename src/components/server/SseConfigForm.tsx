// SseConfigForm.tsx
import { SseConfig } from "@/types";

interface SseConfigFormProps {
  config: SseConfig;
  onConfigChange: (config: SseConfig) => void;
}

export const SseConfigForm = ({
  config,
  onConfigChange,
}: SseConfigFormProps) => {
  const handleHeaderChange = (value: string) => {
    try {
      const headers = JSON.parse(value);
      onConfigChange({ ...config, headers });
    } catch (err) {
      // Handle parsing error
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            URL
          </label>
          <input
            id="url"
            value={config.url || ""}
            onChange={(e) => onConfigChange({ ...config, url: e.target.value })}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Type
          </label>
          <select
            id="type"
            value={config.type}
            onChange={(e) =>
              onConfigChange({
                ...config,
                type: e.target.value as "http" | "sse",
              })
            }
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="http">HTTP</option>
            <option value="sse">SSE</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Headers</label>
        <textarea
          value={
            config.headers ? JSON.stringify(config.headers, null, 2) : "{}"
          }
          onChange={(e) => handleHeaderChange(e.target.value)}
          className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        />
      </div>
    </>
  );
};
