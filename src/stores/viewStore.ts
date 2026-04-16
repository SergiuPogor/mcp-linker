import { create } from "zustand";

export type ViewName =
  | "discover"
  | "manage"
  | "claude-code-manage"
  | "recently"
  | "settings"
  | "auth"
  | "about"
  | "dxt"
  | "dxt-detail"
  | "server"
  | "install-app"
  | "notes"
  | "favorites"
  | "dashboard"
  | "onboarding";

export type ViewParams = Record<string, string>;
export type ViewSearch = Record<string, string>;
export type NavigateFn = (to: string | number, options?: { replace?: boolean }) => void;

interface ViewEntry {
  view: ViewName;
  params: ViewParams;
  search: ViewSearch;
}

interface ViewStore extends ViewEntry {
  history: ViewEntry[];
  navigate: NavigateFn;
}

// Order matters: more specific patterns first
const ROUTES: Array<{ re: RegExp; view: ViewName; keys: string[] }> = [
  { re: /^\/dxt\/([^/?]+)\/([^/?]+)/, view: "dxt-detail", keys: ["user", "repo"] },
  { re: /^\/servers\/([^/?]+)\/([^/?]+)/, view: "server", keys: ["owner", "repo"] },
  { re: /^\/servers\/([^/?]+)/, view: "server", keys: ["id"] },
  { re: /^\/(discover)?$/, view: "discover", keys: [] },
  { re: /^\/manage/, view: "manage", keys: [] },
  { re: /^\/claude-code-manage/, view: "claude-code-manage", keys: [] },
  { re: /^\/recently/, view: "recently", keys: [] },
  { re: /^\/settings/, view: "settings", keys: [] },
  { re: /^\/auth/, view: "auth", keys: [] },
  { re: /^\/about/, view: "about", keys: [] },
  { re: /^\/dxt/, view: "dxt", keys: [] },
  { re: /^\/install-app/, view: "install-app", keys: [] },
  { re: /^\/notes/, view: "notes", keys: [] },
  { re: /^\/favorites/, view: "favorites", keys: [] },
  { re: /^\/dashboard/, view: "dashboard", keys: [] },
  { re: /^\/onboarding/, view: "onboarding", keys: [] },
];

export function parsePath(path: string): ViewEntry {
  const qIdx = path.indexOf("?");
  const pathPart = qIdx >= 0 ? path.slice(0, qIdx) : path;
  const queryPart = qIdx >= 0 ? path.slice(qIdx + 1) : "";

  const search: ViewSearch = {};
  if (queryPart) {
    new URLSearchParams(queryPart).forEach((v, k) => {
      search[k] = v;
    });
  }

  for (const { re, view, keys } of ROUTES) {
    const m = pathPart.match(re);
    if (m) {
      const params: ViewParams = {};
      keys.forEach((k, i) => {
        params[k] = m[i + 1];
      });
      return { view, params, search };
    }
  }

  return { view: "discover", params: {}, search: {} };
}

export function entryToPath({ view, params, search }: ViewEntry): string {
  let path: string;
  switch (view) {
    case "server":
      path = params.owner
        ? `/servers/${params.owner}/${params.repo}`
        : `/servers/${params.id ?? ""}`;
      break;
    case "dxt-detail":
      path = `/dxt/${params.user}/${params.repo}`;
      break;
    case "discover":
      path = "/";
      break;
    default:
      path = `/${view}`;
  }
  const q = new URLSearchParams(search).toString();
  return q ? `${path}?${q}` : path;
}

function getInitialEntry(): ViewEntry {
  try {
    const saved = localStorage.getItem("lastRoute");
    if (saved && saved !== "/") return parsePath(saved);
  } catch {}
  return { view: "discover", params: {}, search: {} };
}

const initial = getInitialEntry();

export const useViewStore = create<ViewStore>((set, get) => ({
  ...initial,
  history: [initial],

  navigate: (to, options) => {
    if (typeof to === "number") {
      if (to === 0) {
        window.location.reload();
        return;
      }
      if (to === -1) {
        const { history } = get();
        if (history.length > 1) {
          const newHist = history.slice(0, -1);
          const prev = newHist[newHist.length - 1];
          localStorage.setItem("lastRoute", entryToPath(prev));
          set({ ...prev, history: newHist });
        }
      }
      return;
    }

    const entry = parsePath(to);
    localStorage.setItem("lastRoute", to);

    set((state) => {
      const newHist = options?.replace
        ? [...state.history.slice(0, -1), entry]
        : [...state.history, entry];
      return { ...entry, history: newHist };
    });
  },
}));
