import { create } from "zustand";

interface ClientPathState {
  selectedClient: string;
  selectedPath: string | null;
  setSelectedClient: (client: string) => void;
  setSelectedPath: (path: string | null) => void;
}

// Get initial client from localStorage or use default
const getInitialClient = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("selectedClient") || "claude";
  }
  return "claude";
};

export const useClientPathStore = create<ClientPathState>((set) => ({
  selectedClient: getInitialClient(),
  selectedPath: null,
  setSelectedClient: (client) =>
    set((state) => {
      if (state.selectedClient !== client) {
        // Save to localStorage when client changes
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedClient", client);
        }
        return { selectedClient: client };
      }
      return {};
    }),
  setSelectedPath: (path) =>
    set((state) => (state.selectedPath !== path ? { selectedPath: path } : {})),
}));
