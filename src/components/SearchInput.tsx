
interface SearchInputProps {
  inputVal: string;
  setInputVal: (val: string) => void;
  setSearchTerm: (val: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  shouldMaintainFocus: React.MutableRefObject<boolean>;
  placeholder?: string;
}

export function SearchInput({
  inputVal,
  setInputVal,
  setSearchTerm,
  inputRef,
  shouldMaintainFocus,
  placeholder = "Search...",
}: SearchInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSearchTerm(inputVal);
        shouldMaintainFocus.current = true;
      }}
      className="w-full"
    >
      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            setSearchTerm(inputVal);
            shouldMaintainFocus.current = true;
          }
        }}
        onBlur={() => {
          if (shouldMaintainFocus.current) {
            setTimeout(() => {
              inputRef.current?.focus();
            }, 10);
          }
        }}
        placeholder={placeholder}
        className="px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
      />
    </form>
  );
}
