import { create } from "zustand";

interface RepoUrlState {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
}

export const useRepoUrlStore = create<RepoUrlState>((set) => ({
  repoUrl: "",
  setRepoUrl: (url: string) => set({ repoUrl: url }),
}));
