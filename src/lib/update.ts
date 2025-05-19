import { getVersion } from "@tauri-apps/api/app";

const LOCAL_STORAGE_KEY_VERSION = "mcp_cached_version";
const LOCAL_STORAGE_KEY_LATEST = "mcp_cached_latest_version";

function getCachedVersions() {
  return {
    version: localStorage.getItem(LOCAL_STORAGE_KEY_VERSION),
    latest: localStorage.getItem(LOCAL_STORAGE_KEY_LATEST),
  };
}

function setCachedVersions(version: string, latest: string) {
  localStorage.setItem(LOCAL_STORAGE_KEY_VERSION, version);
  localStorage.setItem(LOCAL_STORAGE_KEY_LATEST, latest);
  localStorage.setItem("mcp_cached_time", Date.now().toString());
}

const REPO = "milisp/mcp-linker";

export async function checkForUpdate() {
  try {
    const currentVersion = await getVersion();
    const { version: cachedVersion, latest: cachedLatestVersion } = getCachedVersions();
    const lastCheck = parseInt(localStorage.getItem("mcp_cached_time") || "0", 10);
    const CACHE_DURATION = 86400000; // 24 hours in milliseconds
    const isCacheValid = Date.now() - lastCheck < CACHE_DURATION;

    if (cachedVersion === currentVersion && cachedLatestVersion !== null && isCacheValid) {
      return;
    }
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    const data = await res.json();
    const latestVersion = data.tag_name;
    setCachedVersions(currentVersion, latestVersion);

    if (latestVersion !== `v${currentVersion}`) {
      const confirmUpdate = confirm(
        `new ${latestVersion} go to GitHub release`
      );
      if (confirmUpdate) {
        window.open(`https://github.com/${REPO}/releases/latest`, "_blank");
      }
    }
  } catch (err) {
    console.error("check update error:", err);
  }
}