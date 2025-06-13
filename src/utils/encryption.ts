// Encryption utilities for server configurations
import { invoke } from "@tauri-apps/api/core";

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<string> {
  return await invoke("generate_encryption_key");
}

// Encrypt server configuration
export async function encryptConfig(
  data: string,
  keyString: string,
): Promise<string> {
  return await invoke("encrypt_data", { data, key: keyString });
}

// Decrypt server configuration
export async function decryptConfig(
  encryptedData: string,
  keyString: string,
): Promise<string> {
  const decryptedData = await invoke<string>("decrypt_data", {
    encryptedData,
    key: keyString,
  });
  return decryptedData;
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
