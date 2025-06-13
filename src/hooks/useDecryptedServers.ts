import { useEncryptedConfig } from "@/hooks/useEncryptedConfig";
import { ServerTableData } from "@/types";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface DecryptionState {
  decryptedServers: ServerTableData[];
  isLoading: boolean;
  error: string | null;
}

export const useDecryptedServers = (servers: ServerTableData[]) => {
  const { decryptServerConfig, isEncrypted } = useEncryptedConfig();
  const [decryptionState, setDecryptionState] = useState<DecryptionState>({
    decryptedServers: [],
    isLoading: true,
    error: null,
  });

  // Memoize encrypted servers to avoid unnecessary decryption
  const encryptedServers = useMemo(
    () => servers.filter(isEncrypted),
    [servers, isEncrypted],
  );

  const regularServers = useMemo(
    () => servers.filter((server) => !isEncrypted(server)),
    [servers, isEncrypted],
  );

  // Optimize decryption process
  useEffect(() => {
    let isCancelled = false;

    const decryptServers = async () => {
      if (encryptedServers.length === 0) {
        if (!isCancelled) {
          setDecryptionState({
            decryptedServers: regularServers,
            isLoading: false,
            error: null,
          });
        }
        return;
      }

      try {
        setDecryptionState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }));

        const decryptedPromises = encryptedServers.map(async (server) => {
          try {
            const decryptedConfig = await decryptServerConfig(server);
            return { ...decryptedConfig, name: server.name } as ServerTableData;
          } catch (error) {
            console.error(`Failed to decrypt server ${server.name}:`, error);
            // Return a ServerTableData with default command properties if decryption fails
            return {
              name: server.name,
              type: "stdio",
              command: "N/A (Decryption Failed)",
              args: [],
            } as ServerTableData;
          }
        });

        const decryptedEncrypted = await Promise.all(decryptedPromises);
        const allDecrypted = [...regularServers, ...decryptedEncrypted];

        if (!isCancelled) {
          setDecryptionState({
            decryptedServers: allDecrypted,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error during decryption process:", error);
        if (!isCancelled) {
          setDecryptionState({
            decryptedServers: regularServers,
            isLoading: false,
            error: "Failed to decrypt some server configurations",
          });
          toast.error("Failed to decrypt some server configurations");
        }
      }
    };

    decryptServers();

    return () => {
      isCancelled = true;
    };
  }, [encryptedServers, regularServers, decryptServerConfig]);

  return decryptionState;
}; 