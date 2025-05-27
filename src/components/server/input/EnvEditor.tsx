import { KeyValueEditor } from "@/components/shared/KeyValueEditor";
interface EnvEditorProps {
  env: Record<string, string>;
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
  isEdit,
}: EnvEditorProps) => (
  <KeyValueEditor
    title="env"
    values={envValues}
    originalValues={env}
    onChange={onEnvChange}
    setValues={setEnvValues}
    editable={isEdit}
    supportVisibility={true}
  />
);
