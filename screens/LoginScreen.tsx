// Login screen — email + password, with a Face ID / Touch ID button
// that appears when the device supports it and a session has been saved.

import React, { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { ZP } from "../constants/brand";
import { GradientButton } from "../components/ui/GradientButton";
import {
  biometricAuthenticate, biometricSupport, isBiometricEnabled, login, restoreSession, setBiometricEnabled,
} from "../lib/auth";
import { getEmail, hasSession } from "../lib/session";

export function LoginScreen({ onAuthed }: { onAuthed: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [bioTypes, setBioTypes] = useState<string[]>([]);
  const [canBioUnlock, setCanBioUnlock] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getEmail();
      if (saved) setEmail(saved);
      const bio = await biometricSupport();
      setBioTypes(bio.types);
      setCanBioUnlock(bio.available && (await hasSession()) && (await isBiometricEnabled()));
    })();
  }, []);

  const submit = async () => {
    setErr(null);
    if (!email.trim() || !password) { setErr("Email + password required."); return; }
    setLoading(true);
    try {
      const r = await login(email, password);
      if (!r.ok) { setErr(r.error); return; }
      // Offer to enable biometric if available and not yet enabled.
      const bio = await biometricSupport();
      if (bio.available && !(await isBiometricEnabled())) {
        await setBiometricEnabled(true);
      }
      onAuthed();
    } finally { setLoading(false); }
  };

  const unlockWithBiometric = async () => {
    setErr(null);
    const ok = await biometricAuthenticate(`Unlock ZeniPay with ${bioTypes[0] ?? "biometric"}`);
    if (!ok) return;
    const restored = await restoreSession();
    if (!restored) {
      setErr("Your session expired. Sign in again.");
      return;
    }
    onAuthed();
  };

  const bioLabel = bioTypes[0] ?? "Face ID";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 28, paddingTop: 60 }}>
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 20,
              backgroundColor: "#0f172a",
              alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <Text style={{ color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1 }}>Z</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: "800", color: ZP.text, letterSpacing: -0.6 }}>ZeniPay</Text>
            <Text style={{ fontSize: 13, color: ZP.muted, marginTop: 4 }}>
              Banking for AI-first businesses.
            </Text>
          </View>

          <Label>Email</Label>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            style={input}
            placeholder="you@business.com"
            placeholderTextColor={ZP.dim}
          />

          <Label style={{ marginTop: 14 }}>Password</Label>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            style={input}
            placeholderTextColor={ZP.dim}
          />

          {err && (
            <View style={{ marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: "rgba(220,38,38,0.06)", borderWidth: 1, borderColor: "rgba(220,38,38,0.25)" }}>
              <Text style={{ color: ZP.danger, fontWeight: "700", fontSize: 13 }}>{err}</Text>
            </View>
          )}

          <View style={{ marginTop: 22 }}>
            <GradientButton label={loading ? "Signing in…" : "Sign in"} loading={loading} onPress={submit} fullWidth size="lg" />
          </View>

          {canBioUnlock && (
            <View style={{ marginTop: 12 }}>
              <GradientButton
                label={`Unlock with ${bioLabel}`}
                variant="ghost"
                onPress={unlockWithBiometric}
                fullWidth
                size="md"
              />
            </View>
          )}

          <Text style={{ marginTop: 24, fontSize: 12, color: ZP.muted, textAlign: "center" }}>
            By signing in you agree to the ZeniPay Terms + Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <Text style={[{
      fontSize: 10, fontWeight: "800", color: ZP.muted,
      letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6,
    }, style]}>{children}</Text>
  );
}

const input = {
  padding: 14,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: ZP.border,
  backgroundColor: ZP.bg2,
  color: ZP.text,
  fontSize: 15,
};
