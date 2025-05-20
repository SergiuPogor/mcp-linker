import { ChevronDown } from "lucide-react";

interface ScrollToBottomButtonProps {
  onClick: () => void;
}

export const ScrollToBottomButton = ({
  onClick,
}: ScrollToBottomButtonProps) => {
  return (
    <div className="fixed bottom-20 right-16 z-50">
      <button
        onClick={onClick}
        className="bg-transparent border border-blue-600 text-blue-600 px-2 py-2 rounded-full shadow-md hover:border-blue-700 dark:border-blue-500 dark:text-blue-500 dark:hover:border-blue-600"
      >
        <ChevronDown />
      </button>
    </div>
  );
};
