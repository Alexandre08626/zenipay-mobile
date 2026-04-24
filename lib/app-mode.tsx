// Centralized source of truth for which "mode" the app is in —
// `merchant` (banking, cyan accent) vs `agents` (AI treasury, violet).
// Persisted to SecureStore so the choice survives relaunches.

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export type AppMode = "merchant" | "agents";

const MODE_KEY = "zp_app_mode";

interface Ctx {
  mode: AppMode | null;          // null → user hasn't chosen yet
  setMode: (m: AppMode) => Promise<void>;
  ready: boolean;
}

const ModeCtx = createContext<Ctx | null>(null);

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await SecureStore.getItemAsync(MODE_KEY).catch(() => null);
      if (saved === "merchant" || saved === "agents") setModeState(saved);
      setReady(true);
    })();
  }, []);

  const setMode = useCallback(async (m: AppMode) => {
    setModeState(m);
    await SecureStore.setItemAsync(MODE_KEY, m);
  }, []);

  return <ModeCtx.Provider value={{ mode, setMode, ready }}>{children}</ModeCtx.Provider>;
}

export function useAppMode(): Ctx {
  const c = useContext(ModeCtx);
  if (!c) throw new Error("useAppMode must be used inside AppModeProvider");
  return c;
}

export async function clearMode(): Promise<void> {
  await SecureStore.deleteItemAsync(MODE_KEY).catch(() => undefined);
}
