// shared/KeyValueEditor.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface KeyValueEditorProps {
  title: string;
  values: Record<string, string>;
  originalValues?: Record<string, string>;
  onChange: (key: string, value: string) => void;
  setValues: (v: Record<string, string>) => void;
  editable: boolean;
  supportVisibility?: boolean;
}

export const KeyValueEditor = ({
  title,
  values,
  originalValues,
  onChange,
  setValues,
  editable,
  supportVisibility = false,
}: KeyValueEditorProps) => {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleVisibility = (key: string) =>
    setVisibleKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleAdd = () => {
    const newKey = `key_${Date.now()}`;
    setValues({ ...values, [newKey]: "" });
    onChange(newKey, "");
  };

  return (
    <div className="grid gap-2">
      <div className="flex justify-between">
        <h2 className="text-foreground dark:text-gray-200">{title}</h2>
        {editable && <Button onClick={handleAdd}>Add</Button>}
      </div>
      <div className="space-y-2">
        {Object.entries(values).map(([key, value], index) => (
          <div key={index} className="flex items-center gap-2">
            {editable ? (
              <Input
                value={key}
                onChange={(e) => {
                  const newKey = e.target.value;
                  if (!newKey || newKey === key) return;
                  const updated = { ...values };
                  const oldValue = updated[key];
                  delete updated[key];
                  updated[newKey] = oldValue;
                  setValues(updated);
                  onChange(key, "");
                  onChange(newKey, oldValue);
                }}
              />
            ) : (
              <Label>{key}</Label>
            )}
            <div className="relative w-full">
              <Input
                type={
                  supportVisibility && !visibleKeys[key] ? "password" : "text"
                }
                value={value}
                placeholder={originalValues?.[key] || ""}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setValues({ ...values, [key]: newValue });
                  onChange(key, newValue);
                }}
              />
              {value && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 flex items-center"
                  onClick={() => {
                    const updated = { ...values, [key]: "" };
                    setValues(updated);
                    onChange(key, "");
                  }}
                >
                  ❌
                </button>
              )}
            </div>
            {supportVisibility && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleVisibility(key)}
              >
                {visibleKeys[key] ? "👁️" : "🙈"}
              </Button>
            )}
            {editable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const updated = { ...values };
                  delete updated[key];
                  setValues(updated);
                  onChange(key, "");
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
