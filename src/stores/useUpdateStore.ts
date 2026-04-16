import { create } from "zustand";
import { Update } from "@tauri-apps/plugin-updater";

interface UpdateStore {
  isChecking: boolean;
  update: Update | null;
  error: string | null;
  showDialog: boolean;
  
  // Actions
  setChecking: (isChecking: boolean) => void;
  setUpdate: (update: Update | null) => void;
  setError: (error: string | null) => void;
  setShowDialog: (show: boolean) => void;
  
  // Method to trigger manual check
  manualCheckTrigger: number;
  triggerManualCheck: () => void;
}

export const useUpdateStore = create<UpdateStore>((set) => ({
  isChecking: false,
  update: null,
  error: null,
  showDialog: false,
  manualCheckTrigger: 0,
  
  setChecking: (isChecking) => set({ isChecking }),
  setUpdate: (update) => set({ update }),
  setError: (error) => set({ error }),
  setShowDialog: (showDialog) => set({ showDialog }),
  triggerManualCheck: () => set((state) => ({ manualCheckTrigger: state.manualCheckTrigger + 1 })),
}));
