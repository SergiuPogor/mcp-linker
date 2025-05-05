// EnvEditor.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EnvEditorProps {
  env: Record<string, string>;
  envValues: Record<string, string>;
  setEnvValues: (values: Record<string, string>) => void;
  onEnvChange: (key: string, value: string) => void;
}

export const EnvEditor = ({
  env,
  envValues,
  setEnvValues,
  onEnvChange,
}: EnvEditorProps) => {
  return (
    <div className="grid gap-2">
      <h2 className="text-foreground dark:text-gray-200">env</h2>
      <div className="space-y-2">
        {Object.entries(env).map(([key, value], envIndex) => (
          <div
            key={envIndex}
            className="grid grid-cols-2 items-center gap-2"
          >
            <Label className="col-span-1 text-foreground dark:text-gray-200">
              {key}
            </Label>
            <Input
              className="col-span-3 dark:bg-gray-800 dark:border-gray-500 dark:text-white"
              value={envValues[key] || ""}
              placeholder={value}
              onChange={(e) => {
                setEnvValues((prev) => ({
                  ...prev,
                  [key]: e.target.value,
                }));
                onEnvChange(key, e.target.value || value);
              }}
              required
            />
          </div>
        ))}
      </div>
    </div>
  );
};
