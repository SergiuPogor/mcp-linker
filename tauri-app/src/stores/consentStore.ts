import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConsentStore {
  hasAgreedToTerms: boolean;
  telemetryEnabled: boolean;
  agreeToTerms: () => void;
  declineTerms: () => void;
  toggleTelemetry: (val: boolean) => void;
}

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set, get) => ({
      hasAgreedToTerms: false,
      telemetryEnabled: false,
      agreeToTerms: () =>
        set({
          hasAgreedToTerms: true,
          telemetryEnabled: true,
        }),
      declineTerms: () =>
        set({
          hasAgreedToTerms: false,
          telemetryEnabled: false,
        }),
      toggleTelemetry: (val: boolean) => {
        if (get().hasAgreedToTerms) {
          set({ telemetryEnabled: val });
        }
      },
    }),
    {
      name: "consent-storage", // unique name for localStorage
    },
  ),
);