import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeOff, Fingerprint } from "lucide-react-native";
import { ZP } from "../../constants/brand";
import { GradientButton } from "../../components/ui/GradientButton";
import { biometricAuthenticate, biometricSupport, isBiometricEnabled, login, restoreSession, setBiometricEnabled } from "../../lib/auth";
import { getEmail, hasSession } from "../../lib/session";

export function LoginScreen({ onAuthed }: { onAuthed: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [bioTypes, setBioTypes] = useState<string[]>([]);
  const [canBio, setCanBio] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getEmail();
      if (saved) setEmail(saved);
      const bio = await biometricSupport();
      setBioTypes(bio.types);
      setCanBio(bio.available && (await hasSession()) && (await isBiometricEnabled()));
    })();
  }, []);

  const submit = async () => {
    setErr(null);
    if (!email.trim() || !password) { setErr("Email + password required."); return; }
    setLoading(true);
    try {
      const r = await login(email, password);
      if (!r.ok) { setErr(r.error); return; }
      const b = await biometricSupport();
      if (b.available && !(await isBiometricEnabled())) await setBiometricEnabled(true);
      onAuthed();
    } finally { setLoading(false); }
  };

  const unlock = async () => {
    setErr(null);
    const ok = await biometricAuthenticate(`Unlock ZeniPay`);
    if (!ok) return;
    const restored = await restoreSession();
    if (!restored) { setErr("Session expired. Sign in again."); return; }
    onAuthed();
  };

  const bioName = bioTypes[0] ?? "Face ID";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 28, paddingTop: 60 }}>
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <LinearGradient
              colors={ZP.gradient as unknown as [string, string, string]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14 }}
            >
              <Text style={{ color: "#fff", fontFamily: ZP.font.sansBold, fontSize: 32, letterSpacing: -1 }}>Z</Text>
            </LinearGradient>
            <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 26, color: ZP.text, letterSpacing: -0.5 }}>
              Welcome back
            </Text>
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 13, color: ZP.muted, marginTop: 4 }}>
              Sign in to ZeniPay
            </Text>
          </View>

          <Label>Email</Label>
          <TextInput
            value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress"
            style={input}
            placeholder="you@business.com" placeholderTextColor={ZP.dim}
          />

          <Label style={{ marginTop: 14 }}>Password</Label>
          <View style={{ position: "relative" }}>
            <TextInput
              value={password} onChangeText={setPassword}
              secureTextEntry={!showPw} textContentType="password"
              style={[input, { paddingRight: 44 }]}
              placeholderTextColor={ZP.dim}
            />
            <Pressable
              onPress={() => setShowPw((v) => !v)}
              style={{ position: "absolute", right: 6, top: 6, padding: 10 }}
            >
              {showPw ? <EyeOff size={18} color={ZP.muted} /> : <Eye size={18} color={ZP.muted} />}
            </Pressable>
          </View>

          {err && (
            <View style={{
              marginTop: 14, padding: 12, borderRadius: 10,
              backgroundColor: ZP.dangerBg, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)",
            }}>
              <Text style={{ color: ZP.danger, fontFamily: ZP.font.sansSemi, fontSize: 13 }}>{err}</Text>
            </View>
          )}

          <View style={{ marginTop: 22 }}>
            <GradientButton label={loading ? "Signing in…" : "Sign in"} loading={loading} onPress={submit} fullWidth size="lg" />
          </View>

          {canBio && (
            <View style={{ marginTop: 12 }}>
              <GradientButton
                label={`Unlock with ${bioName}`}
                variant="ghost"
                icon={<Fingerprint size={16} color={ZP.muted} />}
                onPress={unlock} fullWidth size="md"
              />
            </View>
          )}

          <Text style={{ marginTop: 24, fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, textAlign: "center" }}>
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
      fontFamily: ZP.font.sansSemi, fontSize: 10, color: ZP.muted,
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
  fontFamily: ZP.font.sans,
  fontSize: 15,
};
