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
  const key = localStorage.getItem(`encryption_key_${teamId || "personal"}`);
  return key;
}

// Store encryption key for a specific team
export function storeEncryptionKey(key: string, teamId?: string): void {
  localStorage.setItem(`encryption_key_${teamId || "personal"}`, key);
}

// Generate and store a new encryption key if one doesn't exist
export async function ensureEncryptionKey(teamId?: string): Promise<string> {
  let key = getEncryptionKey(teamId);
  if (!key) throw new Error("Encryption key not found for this team.");
  return key;
}
