interface HeaderEditorProps {
  header: Record<string, string>;
  headerValues: Record<string, string>;
  setHeaderValues: (values: Record<string, string>) => void;
  onHeaderChange: (key: string, value: string) => void;
}
import { KeyValueEditor } from "@/components/shared/KeyValueEditor";

export const HeaderEditor = ({
  header,
  headerValues,
  setHeaderValues,
  onHeaderChange,
}: HeaderEditorProps) => (
  <KeyValueEditor
    title="header"
    values={headerValues}
    originalValues={header}
    onChange={onHeaderChange}
    setValues={setHeaderValues}
    editable={true}
  />
);
