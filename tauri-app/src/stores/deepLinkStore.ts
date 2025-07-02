import { create } from "zustand";

interface DeepLinkState {
  isHandlingDeepLink: boolean;
  setIsHandlingDeepLink: (v: boolean) => void;
}

export const useDeepLinkStore = create<DeepLinkState>((set) => ({
  isHandlingDeepLink: false,
  setIsHandlingDeepLink: (v) => set({ isHandlingDeepLink: v }),
}));
