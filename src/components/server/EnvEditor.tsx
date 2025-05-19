// EnvEditor.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface EnvEditorProps {
  env?: Record<string, string>;
  envValues: Record<string, string>;
  setEnvValues: (values: Record<string, string>) => void;
  onEnvChange: (key: string, value: string) => void;
  isEdit: boolean;
}

export const EnvEditor = ({
  env,
  envValues,
  setEnvValues,
  onEnvChange,
  isEdit = false,
}: EnvEditorProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleVisibility = (key: string) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddEnv = () => {
    const newKey = `NEW_KEY_${Object.keys(envValues).length + 1}`;
    setEnvValues({
      ...envValues,
      [newKey]: "",
    });
    onEnvChange(newKey, "");
  };

  return (
    <div className="grid gap-2">
      <div className="flex justify-between">
        <h2 className="text-foreground dark:text-gray-200">env</h2>
        {isEdit && <Button onClick={handleAddEnv}>addEnv</Button>}
      </div>
      <div className="space-y-2">
        {Object.entries(envValues).map(([key, value], envIndex) => (
          <div key={envIndex} className="flex items-center gap-2">
            {isEdit ? (
              <Input
                className="col-span-1 dark:bg-gray-800 dark:border-gray-500 dark:text-white"
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;
                  if (!newKey || newKey === key) return;

                  const value = envValues[key];
                  const updatedEnvValues = { ...envValues };
                  delete updatedEnvValues[key];
                  updatedEnvValues[newKey] = value;
                  setEnvValues(updatedEnvValues);

                  // Clear old key and set new key in env
                  onEnvChange(key, "");
                  onEnvChange(newKey, value);
                }}
                required
              />
            ) : (
              <Label className="col-span-1 text-foreground dark:text-gray-200">
                {key}
              </Label>
            )}
            <div className="relative w-full col-span-3">
              <Input
                type={visibleKeys[key] ? "text" : "password"}
                className="pr-10 dark:bg-gray-800 dark:border-gray-500 dark:text-white"
                value={value}
                placeholder={env?.[key] || ""}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setEnvValues({
                    ...envValues,
                    [key]: newValue,
                  });
                  onEnvChange(key, newValue);
                }}
                required
              />
              {value && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-red-600"
                  onClick={() => {
                    const updatedEnvValues = { ...envValues, [key]: "" };
                    setEnvValues(updatedEnvValues);
                    onEnvChange(key, "");
                  }}
                >
                  ❌
                </button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleVisibility(key)}
              className="text-xl"
            >
              {visibleKeys[key] ? "👁️" : "🙈"}
            </Button>
            {isEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updatedEnvValues = { ...envValues };
                  delete updatedEnvValues[key];
                  setEnvValues(updatedEnvValues);
                  onEnvChange(key, "");
                }}
              >
                🗑️
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
