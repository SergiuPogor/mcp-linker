import { getClient } from "@/lib/clients";
import { getLicenseStatus, type LicenseStatus, type Tier } from "@/lib/license";
import { create } from "zustand";

/** Paid features. Keep in step with `license::require` calls in src-tauri. */
export type ProFeature = "sync" | "batch" | "inspection" | "toolPolicy";

/** The tier each feature needs by default; `sync` comes from its two clients. */
const FEATURE_TIER: Record<Exclude<ProFeature, "sync">, Tier> = {
  batch: "plus",
  inspection: "plus",
  toolPolicy: "pro",
};

const RANK: Record<Tier, number> = { free: 0, plus: 1, pro: 2 };

interface Upgrade {
  feature: ProFeature;
  /** The tier that unlocks it. */
  tier: Tier;
}

interface LicenseState {
  status: LicenseStatus | null;
  /** What the upgrade dialog is open for, if anything. */
  upgrade: Upgrade | null;
  load: () => Promise<void>;
  setStatus: (status: LicenseStatus) => void;
  closeUpgrade: () => void;
}

export const useLicense = create<LicenseState>()(set => ({
  status: null,
  upgrade: null,
  load: async () => set({ status: await getLicenseStatus() }),
  setStatus: status => set({ status }),
  closeUpgrade: () => set({ upgrade: null }),
}));

const covers = (have: Tier | undefined, need: Tier) => RANK[have ?? "free"] >= RANK[need];

/** True when this device's license includes `tier`. */
export const useHasTier = (tier: Tier) => useLicense(state => covers(state.status?.tier, tier));

function check(upgrade: Upgrade): boolean {
  if (covers(useLicense.getState().status?.tier, upgrade.tier)) return true;
  useLicense.setState({ upgrade });
  return false;
}

/** True when licensed for `feature`; otherwise opens the upgrade dialog and returns false. */
export function requirePro(feature: Exclude<ProFeature, "sync">, tier: Tier = FEATURE_TIER[feature]): boolean {
  return check({ feature, tier });
}

/**
 * Local Sync needs the higher tier of its two clients: free between Claude
 * Desktop and Cursor, Pro once Claude Code or Codex is involved. Adding and
 * changing servers one at a time is free for every client.
 */
export function requireSync(fromClientId: string, toClientId: string): boolean {
  const tierOf = (id: string): Tier => getClient(id)?.tier ?? "pro";
  const [from, to] = [tierOf(fromClientId), tierOf(toClientId)];
  return check({ feature: "sync", tier: RANK[from] >= RANK[to] ? from : to });
}
