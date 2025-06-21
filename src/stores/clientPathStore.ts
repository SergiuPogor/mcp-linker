import { create } from "zustand";

interface ClientPathState {
  selectedClient: string;
  selectedPath: string | null;
  setSelectedClient: (client: string) => void;
  setSelectedPath: (path: string | null) => void;
  getClientPath: (client: string) => string | null;
  setClientPath: (client: string, path: string | null) => void;
}

// Get initial client from localStorage or use default
const getInitialClient = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("selectedClient") || "claude";
  }
  return "claude";
};

// Get path for a specific client from localStorage
const getClientPathFromStorage = (client: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(`clientPath_${client}`);
  }
  return null;
};

// Set path for a specific client in localStorage
const setClientPathInStorage = (client: string, path: string | null) => {
  if (typeof window !== "undefined") {
    if (path) {
      localStorage.setItem(`clientPath_${client}`, path);
    } else {
      localStorage.removeItem(`clientPath_${client}`);
    }
  }
};

export const useClientPathStore = create<ClientPathState>((set, get) => ({
  selectedClient: getInitialClient(),
  selectedPath: getClientPathFromStorage(getInitialClient()),
  setSelectedClient: (client) =>
    set((state) => {
      if (state.selectedClient !== client) {
        // Save to localStorage when client changes
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedClient", client);
        }
        // Load the path for the new client
        const newPath = getClientPathFromStorage(client);
        return { selectedClient: client, selectedPath: newPath };
      }
      return {};
    }),
  setSelectedPath: (path) =>
    set((state) => {
      if (state.selectedPath !== path) {
        // Save the path for the current client
        setClientPathInStorage(state.selectedClient, path);
        return { selectedPath: path };
      }
      return {};
    }),
  getClientPath: (client: string) => {
    return getClientPathFromStorage(client);
  },
  setClientPath: (client: string, path: string | null) => {
    setClientPathInStorage(client, path);
    // If this is the currently selected client, update the state
    const state = get();
    if (state.selectedClient === client) {
      set({ selectedPath: path });
    }
  },
}));
