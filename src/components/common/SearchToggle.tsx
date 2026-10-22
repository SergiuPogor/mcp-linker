import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

/** A search icon that opens into an input; it folds back when left empty. */
export function SearchToggle({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  if (!open && !value) {
    return (
      <Button variant="ghost" size="icon" aria-label={placeholder} title={placeholder} onClick={() => setOpen(true)}>
        <Search className="size-4" />
      </Button>
    );
  }
  return (
    <div className="relative min-w-40 max-w-sm flex-1">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        autoFocus
        className="rounded-full pl-9"
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        onBlur={() => !value && setOpen(false)}
        onKeyDown={event => {
          if (event.key !== "Escape") return;
          onChange("");
          setOpen(false);
        }}
      />
    </div>
  );
}
