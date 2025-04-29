import { lazy } from "react";

export const Pages: { [key: string]: React.FC<any> } = {
  discover: lazy(() => import("@/views/discovery")),
  manage: lazy(() => import("@/views/manager")),
  favs: lazy(() => import("@/views/favorites")),
  recently: lazy(() => import("@/views/recently")),
  other: lazy(() => import("@/views/other")),
};
