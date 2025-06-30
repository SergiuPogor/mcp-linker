import { ServerConfig } from "@/types";
import { decryptConfig, getEncryptionKey } from "@/utils/encryption";
import { useCallback } from "react";

export function useEncryptedConfig() {
  const decryptServerConfig = useCallback(
    async (config: ServerConfig): Promise<ServerConfig> => {
      if (config.type !== "encrypted") {
        return config;
      }

      const encryptionKey = getEncryptionKey();
      if (!encryptionKey) {
        throw new Error("No encryption key found");
      }

      try {
        const decryptedString = await decryptConfig(config.data, encryptionKey);
        return JSON.parse(decryptedString) as ServerConfig;
      } catch (error) {
        console.error("Error decrypting config:", error);
        throw new Error("Failed to decrypt configuration");
      }
    },
    [],
  );

  const isEncrypted = useCallback((config: ServerConfig): boolean => {
    return config.type === "encrypted";
  }, []);

  return {
    decryptServerConfig,
    isEncrypted,
  };
}
