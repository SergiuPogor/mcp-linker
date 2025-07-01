import { create } from "zustand";

interface DeepLinkState {
  pendingDeepLink: string | null;
  setPendingDeepLink: (url: string | null) => void;
}

export const useDeepLinkStore = create<DeepLinkState>((set) => ({
  pendingDeepLink: null,
  setPendingDeepLink: (url) => set({ pendingDeepLink: url }),
})); 