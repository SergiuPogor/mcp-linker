// utils/urlHelper.ts
import { open } from "@tauri-apps/plugin-shell";

export function openUrl(url: string) {
  open(url + "?from=mcp-linker");
}

export function urlToId(url: string) {
  const utf8Bytes = new TextEncoder().encode(url);
  const base64 = btoa(String.fromCharCode(...utf8Bytes));
  const urlSafe = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return urlSafe;
}

export function idToUrl(uid: string) {
  const padding = "=".repeat((4 - (uid.length % 4)) % 4);
  const base64 = (uid + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
