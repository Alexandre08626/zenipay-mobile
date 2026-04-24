import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Fingerprint, LogOut, Shield } from "lucide-react-native";
import { ZP } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { biometricSupport, isBiometricEnabled, logout, setBiometricEnabled } from "../../lib/auth";
import { getAgentsOrg, getEmail } from "../../lib/session";
import { useAppMode } from "../../lib/app-mode";

export function AgentsSettingsScreen() {
  const nav = useNavigation();
  const { setMode } = useAppMode();
  const [email, setEmail] = useState("");
  const [orgId, setOrgId] = useState("");
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioOn, setBioOn] = useState(false);

  useEffect(() => {
    (async () => {
      setEmail((await getEmail()) ?? "");
      setOrgId((await getAgentsOrg()) ?? "");
      const b = await biometricSupport();
      setBioAvailable(b.available);
      setBioOn(await isBiometricEnabled());
    })();
  }, []);

  const signOut = async () => {
    await logout();
    await setMode("agents");
    nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Settings" onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <BankingCard>
          <Row label="Email"  value={email || "—"} mono />
          <Row label="Org id" value={orgId || "—"} mono />
        </BankingCard>

        {bioAvailable && (
          <BankingCard>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Fingerprint size={18} color={ZP.violet} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 14, color: ZP.text }}>Biometric unlock</Text>
                <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, marginTop: 2 }}>Require Face ID / Touch ID on launch.</Text>
              </View>
              <Switch value={bioOn} onValueChange={async (v) => { await setBiometricEnabled(v); setBioOn(v); }} trackColor={{ true: ZP.violet, false: ZP.bg3 }} />
            </View>
          </BankingCard>
        )}

        <BankingCard padding={0}>
          <Pressable onPress={signOut}>
            {({ pressed }) => (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 16, backgroundColor: pressed ? ZP.dangerBg : "transparent" }}>
                <LogOut size={18} color={ZP.danger} />
                <Text style={{ flex: 1, fontFamily: ZP.font.sansSemi, fontSize: 14, color: ZP.danger }}>Sign out</Text>
                <ChevronRight size={16} color={ZP.danger} />
              </View>
            )}
          </Pressable>
        </BankingCard>

        <BankingCard padding={14}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Shield size={16} color={ZP.muted} />
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, flex: 1 }}>
              Tokens stored in Keychain / Keystore. PAN + CVV always gated behind biometric.
            </Text>
          </View>
        </BankingCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: ZP.border }}>
      <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 11, color: ZP.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</Text>
      <Text style={{ fontFamily: mono ? ZP.font.mono : ZP.font.sans, fontSize: 12, color: ZP.text }} numberOfLines={1}>{value}</Text>
    </View>
  );
}
