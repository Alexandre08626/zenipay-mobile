// App root. Handles the login → main-app handoff:
//   - On launch, try to restore a saved Supabase session.
//   - If a session + biometric enrollment exist, prompt for biometric.
//   - Otherwise land on the Login screen.

import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StatusBar as RNStatusBar, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LoginScreen } from "./screens/LoginScreen";
import { RootNavigator } from "./navigation/RootNavigator";
import { biometricAuthenticate, restoreSession } from "./lib/auth";
import { hasSession, isBiometricEnabled } from "./lib/session";
import { ZP } from "./constants/brand";

type BootState = "booting" | "authed" | "unauthed";

export default function App() {
  const [state, setState] = useState<BootState>("booting");

  const boot = useCallback(async () => {
    const session = await hasSession();
    if (!session) { setState("unauthed"); return; }

    // Refresh / verify the stored session.
    const restored = await restoreSession();
    if (!restored) { setState("unauthed"); return; }

    // If biometric was opted in, gate the app on it.
    if (await isBiometricEnabled()) {
      const ok = await biometricAuthenticate("Unlock ZeniPay");
      if (!ok) { setState("unauthed"); return; }
    }

    setState("authed");
  }, []);

  useEffect(() => { void boot(); }, [boot]);

  if (state === "booting") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0, alignItems: "center", justifyContent: "center" }}>
        <StatusBar style="dark" />
        <ActivityIndicator color={ZP.cyan} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <StatusBar style="dark" />
      {state === "authed" ? <RootNavigator /> : <LoginScreen onAuthed={() => setState("authed")} />}
    </View>
  );
}

// Silence unused warning on older SDKs that don't expose RNStatusBar.
void RNStatusBar;
