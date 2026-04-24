// Secure session storage. expo-secure-store wraps Keychain (iOS) /
// Keystore (Android) so nothing ever hits plaintext on disk.

import * as SecureStore from "expo-secure-store";

const K_ACCESS  = "zp_access_token";
const K_REFRESH = "zp_refresh_token";
const K_EMAIL   = "zp_email";
const K_MERCHANT = "zp_merchant_id";
const K_AGENTS_ORG = "zp_agents_org";
const K_BIOMETRIC_OK = "zp_biometric_enabled";

async function set(k: string, v: string | null): Promise<void> {
  if (v == null || v === "") {
    try { await SecureStore.deleteItemAsync(k); } catch { /* ignore */ }
    return;
  }
  await SecureStore.setItemAsync(k, v);
}
async function get(k: string): Promise<string | null> {
  try { return await SecureStore.getItemAsync(k); } catch { return null; }
}

export async function saveSupabaseTokens(access: string, refresh: string | null): Promise<void> {
  await set(K_ACCESS, access);
  await set(K_REFRESH, refresh);
}
export async function getSupabaseAccessToken(): Promise<string | null> { return get(K_ACCESS); }
export async function getSupabaseRefreshToken(): Promise<string | null> { return get(K_REFRESH); }

export async function saveEmail(email: string | null): Promise<void> { await set(K_EMAIL, email); }
export async function getEmail(): Promise<string | null> { return get(K_EMAIL); }

export async function saveMerchantId(id: string | null): Promise<void> { await set(K_MERCHANT, id); }
export async function getMerchantId(): Promise<string | null> { return get(K_MERCHANT); }

export async function saveAgentsOrg(orgId: string | null): Promise<void> { await set(K_AGENTS_ORG, orgId); }
export async function getAgentsOrg(): Promise<string | null> { return get(K_AGENTS_ORG); }

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await set(K_BIOMETRIC_OK, enabled ? "1" : null);
}
export async function isBiometricEnabled(): Promise<boolean> {
  return (await get(K_BIOMETRIC_OK)) === "1";
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    set(K_ACCESS, null),
    set(K_REFRESH, null),
    set(K_EMAIL, null),
    set(K_MERCHANT, null),
    set(K_AGENTS_ORG, null),
    set(K_BIOMETRIC_OK, null),
  ]);
}

export async function hasSession(): Promise<boolean> {
  const t = await get(K_ACCESS);
  return !!t;
}
