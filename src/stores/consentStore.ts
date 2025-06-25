import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConsentStore {
  hasAgreedToTerms: boolean;
  telemetryEnabled: boolean;
  setHasAgreedToTerms: (val: boolean) => void;
  setTelemetryEnabled: (val: boolean) => void;
  setConsentDeclined: () => void;
}

export const useConsentStore = create<ConsentStore>()(
  persist(
    (set) => ({
      hasAgreedToTerms: false,
      telemetryEnabled: false,
      setHasAgreedToTerms: (val) => set({
        hasAgreedToTerms: val,
        telemetryEnabled: val ? true : false, // Enable telemetry only if agreed
      }),
      setTelemetryEnabled: (val) => set({ telemetryEnabled: val }),
      setConsentDeclined: () => set({
        hasAgreedToTerms: true,
        telemetryEnabled: false,
      }),
    }),
    {
      name: "consent-storage", // unique name for localStorage
    },
  ),
);