// Thin wrapper around fetch() that prefixes the configured API base URL
// and (optionally) attaches the current agents org id header when the
// caller marks the request as "agents-scoped". Mirrors the web app's
// /app/agents/_lib/session.ts apiFetch pattern.

import Constants from "expo-constants";
import { getAgentsOrg, getMerchantId, getSupabaseAccessToken } from "./session";

const DEFAULT_BASE = "https://zenipay.ca";
export const API_BASE: string =
  process.env.EXPO_PUBLIC_API_BASE_URL
  ?? (Constants.expoConfig?.extra as { apiBase?: string } | undefined)?.apiBase
  ?? DEFAULT_BASE;

export interface ApiOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  agentsScoped?: boolean;
  merchantScoped?: boolean;
  signal?: AbortSignal;
}

export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (opts.agentsScoped) {
    const org = await getAgentsOrg();
    if (org) headers["x-zp-agents-org"] = org;
  }
  const token = await getSupabaseAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let targetUrl = url;
  if (opts.merchantScoped && !/[?&]merchant_id=/.test(url)) {
    const mid = await getMerchantId();
    if (mid) targetUrl = `${url}${url.includes("?") ? "&" : "?"}merchant_id=${encodeURIComponent(mid)}`;
  }

  const res = await fetch(targetUrl, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} ${txt.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}
