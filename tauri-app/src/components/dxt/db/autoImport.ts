import { invoke } from "@tauri-apps/api/core";
import { appCacheDir } from "@tauri-apps/api/path";
import { remove } from "@tauri-apps/plugin-fs";
import { insertManifest } from "./create";
import { getAllManifests } from "./index";

// Auto import manifests if the dxt_manifests table is empty
export async function autoImportManifests(onProgress?: (step: number, total: number) => void) {
  const totalSteps = 5;
  let currentStep = 0;

  // 1. Check if table is empty
  const manifests = await getAllManifests();
  if (manifests.length > 0) return;
  onProgress?.(++currentStep, totalSteps);

  const url =
    "https://github.com/milisp/awesome-claude-dxt/releases/download/v1.0.0/manifests.json.zip";

  // 2. Download manifests.zip into the app‑cache directory
  const cacheDir = await appCacheDir();
  const zipPath = `${cacheDir}/manifests.json.zip`;
  await invoke("download_file", { url, destPath: zipPath });
  onProgress?.(++currentStep, totalSteps);

  // 3. Extract the zip into the cache directory
  const zipData: Uint8Array = await invoke("read_binary_file", {
    path: zipPath,
  });
  await invoke("extract_manifests_zip", {
    zipData: Array.from(zipData),
    targetDir: cacheDir,
  });
  onProgress?.(++currentStep, totalSteps);

  // 4. Read manifests.json that was just extracted
  const jsonPath = `${cacheDir}/manifests.json`;
  const jsonBytes = await invoke<Array<number>>("read_binary_file", {
    path: jsonPath,
  });
  const jsonStr = new TextDecoder().decode(new Uint8Array(jsonBytes));
  const manifestArr = JSON.parse(jsonStr);
  if (Array.isArray(manifestArr)) {
    for (const manifest of manifestArr) {
      await insertManifest(manifest);
    }
  }
  onProgress?.(++currentStep, totalSteps);

  // 5. Clean up the downloaded zip
  await remove(zipPath);
  onProgress?.(++currentStep, totalSteps);
}

// Default export for convenience
export default autoImportManifests;
