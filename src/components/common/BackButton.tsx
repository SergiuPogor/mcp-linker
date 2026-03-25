import { useViewStore } from "@/stores/viewStore";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const { navigate } = useViewStore();

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      aria-label="Go back to all DXTs"
    >
      <ChevronLeft size={20} />
      <span>All DXTs</span>
    </button>
  );
}
