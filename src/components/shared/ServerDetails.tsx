import { useEncryptedConfig } from "@/hooks/useEncryptedConfig";
import { ServerConfig } from "@/types";
import { useEffect, useState } from "react";

interface ServerDetailsProps {
  config: ServerConfig;
}

export function ServerDetails({ config }: ServerDetailsProps) {
  const { decryptServerConfig, isEncrypted } = useEncryptedConfig();
  const [decryptedConfig, setDecryptedConfig] = useState<ServerConfig>(config);

  useEffect(() => {
    const loadConfig = async () => {
      if (isEncrypted(config)) {
        try {
          const decrypted = await decryptServerConfig(config);
          setDecryptedConfig(decrypted);
        } catch (error) {
          console.error("Failed to decrypt config:", error);
        }
      } else {
        setDecryptedConfig(config);
      }
    };
    loadConfig();
  }, [config, decryptServerConfig, isEncrypted]);

  if (decryptedConfig.type === "stdio") {
    return (
      <div>
        <p>Command: {decryptedConfig.command}</p>
        <p>Args: {decryptedConfig.args.join(" ")}</p>
        {decryptedConfig.env && Object.keys(decryptedConfig.env).length > 0 && (
          <div>
            <p>Environment Variables:</p>
            <ul>
              {Object.entries(decryptedConfig.env).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  if (decryptedConfig.type === "http" || decryptedConfig.type === "sse") {
    return (
      <div>
        <p>URL: {decryptedConfig.url}</p>
        {decryptedConfig.headers &&
          Object.keys(decryptedConfig.headers).length > 0 && (
            <div>
              <p>Headers:</p>
              <ul>
                {Object.entries(decryptedConfig.headers).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>
    );
  }

  return null;
}
