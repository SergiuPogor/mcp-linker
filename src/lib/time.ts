/** "5 minutes ago" in the app's language, so a commit minutes old reads as such. */
export const timeAgo = (when: string | number, language: string) => {
  const seconds = (new Date(when).getTime() - Date.now()) / 1000;
  if (Number.isNaN(seconds)) return String(when);
  const format = new Intl.RelativeTimeFormat(language, { numeric: "auto" });
  for (const [unit, size] of [["day", 86400], ["hour", 3600], ["minute", 60]] as const) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(Math.round(seconds), "second");
};
