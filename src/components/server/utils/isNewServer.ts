import type { ServerType } from "@/types";

const NEW_SERVER_DAYS = 14;

/** True for catalog servers first committed within the last two weeks. */
export function isNewServer({ addedAt }: ServerType): boolean {
  const added = addedAt ? Date.parse(addedAt) : NaN;
  return Date.now() - added < NEW_SERVER_DAYS * 86_400_000;
}
