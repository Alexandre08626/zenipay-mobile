// Auth flows — login / logout / restore-session / biometric unlock.

import * as LocalAuthentication from "expo-local-authentication";
import { supabase } from "./supabase";
import {
  clearSession, getSupabaseAccessToken, getSupabaseRefreshToken,
  isBiometricEnabled, saveEmail, saveMerchantId, saveSupabaseTokens,
  setBiometricEnabled,
} from "./session";
import { api } from "./api";

export interface AuthResult {
  ok: true;
  email: string;
  merchant_id: string | null;
}
export interface AuthFailure { ok: false; error: string }

export async function login(email: string, password: string): Promise<AuthResult | AuthFailure> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error || !data?.session) {
    return { ok: false, error: error?.message ?? "login_failed" };
  }
  await saveSupabaseTokens(data.session.access_token, data.session.refresh_token ?? null);
  await saveEmail(email.trim().toLowerCase());

  // Best-effort merchant resolution via /api/auth/me fallback.
  try {
    const me = await api<{ merchant_id?: string | null }>("/api/auth/me");
    if (me?.merchant_id) await saveMerchantId(me.merchant_id);
  } catch { /* non-critical — some deployments don’t expose /api/auth/me yet */ }

  return { ok: true, email: email.trim().toLowerCase(), merchant_id: null };
}

export async function logout(): Promise<void> {
  try { await supabase.auth.signOut(); } catch { /* ignore */ }
  await clearSession();
}

export async function restoreSession(): Promise<boolean> {
  const access = await getSupabaseAccessToken();
  const refresh = await getSupabaseRefreshToken();
  if (!access) return false;
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: access,
      refresh_token: refresh ?? "",
    });
    if (error || !data?.session) return false;
    await saveSupabaseTokens(data.session.access_token, data.session.refresh_token ?? null);
    return true;
  } catch { return false; }
}

export interface BiometricSupport {
  available: boolean;
  types: string[];
}
export async function biometricSupport(): Promise<BiometricSupport> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const names = types.map((t) => {
    switch (t) {
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION: return "Face ID";
      case LocalAuthentication.AuthenticationType.FINGERPRINT:         return "Touch ID";
      case LocalAuthentication.AuthenticationType.IRIS:                return "Iris";
      default:                                                         return "biometric";
    }
  });
  return { available: hasHardware && enrolled, types: names };
}

export async function biometricAuthenticate(reason = "Unlock ZeniPay"): Promise<boolean> {
  const support = await biometricSupport();
  if (!support.available) return false;
  const res = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    cancelLabel: "Use password",
    disableDeviceFallback: false,
  });
  return !!res.success;
}

export { isBiometricEnabled, setBiometricEnabled };
