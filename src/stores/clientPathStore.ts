import { create } from "zustand";

interface ClientPathState {
  selectedClient: string;
  selectedPath: string;
  setSelectedClient: (client: string) => void;
  setSelectedPath: (path: string) => void;
}

export const useClientPathStore = create<ClientPathState>((set) => ({
  selectedClient: "claude",
  selectedPath: "",
  setSelectedClient: (client) => set({ selectedClient: client }),
  setSelectedPath: (path) => set({ selectedPath: path }),
}));
