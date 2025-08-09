import { create } from "zustand";

interface FileViewerStore {
  selectedFile: string | null;
  setSelectedFile: (file: string | null) => void;
}

export const useFileViewerStore = create<FileViewerStore>((set) => ({
  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),
}));