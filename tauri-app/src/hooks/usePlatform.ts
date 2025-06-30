import { platform } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";

export const usePlatform = () => {
  const [currentPlatform, setCurrentPlatform] = useState<string>("");

  useEffect(() => {
    // platform() returns a string synchronously
    const platformName = platform();
    setCurrentPlatform(platformName);
  }, []);

  return {
    platform: currentPlatform,
    isMacOS: currentPlatform === "macos",
    isWindows: currentPlatform === "windows",
    isLinux: currentPlatform === "linux",
  };
};
