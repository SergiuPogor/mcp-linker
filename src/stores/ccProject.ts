import { create } from "zustand";

interface CCProjectState {
  projects: string[];
  selectedProject: string | null;
  setProjects: (projects: string[]) => void;
  setSelectedProject: (project: string) => void;
}

export const useCCProjectStore = create<CCProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  setProjects: (projects) => set({ projects }),
  setSelectedProject: (project) => set({ selectedProject: project }),
}));
