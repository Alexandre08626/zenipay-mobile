import "react-native-gesture-handler";
import React, { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";

import { ZP } from "./constants/brand";
import { AppModeProvider } from "./lib/app-mode";
import { ToastProvider } from "./components/ui/Toast";
import { SplashScreen } from "./screens/auth/SplashScreen";
import { LoginScreen } from "./screens/auth/LoginScreen";
import { RootNavigator } from "./navigation/RootNavigator";
import { biometricAuthenticate, restoreSession } from "./lib/auth";
import { hasSession, isBiometricEnabled } from "./lib/session";

type BootState = "booting" | "authed" | "unauthed";

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
    JetBrainsMono_400Regular, JetBrainsMono_500Medium,
  });

  const [state, setState] = useState<BootState>("booting");

  const boot = useCallback(async () => {
    if (!(await hasSession())) { setState("unauthed"); return; }
    const restored = await restoreSession();
    if (!restored) { setState("unauthed"); return; }
    if (await isBiometricEnabled()) {
      const ok = await biometricAuthenticate("Unlock ZeniPay");
      if (!ok) { setState("unauthed"); return; }
    }
    setState("authed");
  }, []);

  useEffect(() => {
    if (fontsLoaded) void boot();
  }, [fontsLoaded, boot]);

  if (!fontsLoaded || state === "booting") {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppModeProvider>
        <ToastProvider>
          <View style={{ flex: 1, backgroundColor: ZP.bg0 }}>
            <StatusBar style="dark" />
            {state === "authed" ? <RootNavigator /> : <LoginScreen onAuthed={() => setState("authed")} />}
          </View>
        </ToastProvider>
      </AppModeProvider>
    </GestureHandlerRootView>
  );
}

// Silence unused import in the case the SafeAreaView isn't rendered here.
void SafeAreaView; void ActivityIndicator;
