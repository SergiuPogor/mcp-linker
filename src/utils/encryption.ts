// Encryption utilities for server configurations
import { ServerConfig } from "@/types";
import { invoke } from "@tauri-apps/api/core";

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<string> {
  return await invoke("generate_encryption_key");
}

// Encrypt server configuration
export async function encryptConfig(
  config: ServerConfig,
  keyString: string,
): Promise<string> {
  return await invoke("encrypt_data", { data: config, key: keyString });
}

// Decrypt server configuration
export async function decryptConfig(
  encryptedData: string,
  keyString: string,
): Promise<ServerConfig> {
  const decryptedConfig = await invoke<ServerConfig>("decrypt_data", {
    encryptedData,
    key: keyString,
  });
  return decryptedConfig;
}

// Store encryption key in localStorage
export function storeEncryptionKey(key: string): void {
  localStorage.setItem("mcp_encryption_key", key);
}

// Get encryption key from localStorage
export function getEncryptionKey(): string | null {
  return localStorage.getItem("mcp_encryption_key");
}

// Generate and store a new encryption key if one doesn't exist
export async function ensureEncryptionKey(): Promise<string> {
  let key = getEncryptionKey();
  if (!key) {
    key = await generateEncryptionKey();
    storeEncryptionKey(key);
  }
  return key;
}
