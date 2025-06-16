// Encryption utilities for server configurations
import { invoke } from "@tauri-apps/api/core";

// Generate a new encryption key
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

// Get encryption key for a specific team
export function getEncryptionKey(teamId?: string): string | null {
  const key = localStorage.getItem(`encryption_key_${teamId || "default"}`);
  return key;
}

// Store encryption key for a specific team
export function storeEncryptionKey(key: string, teamId?: string): void {
  localStorage.setItem(`encryption_key_${teamId || "default"}`, key);
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
