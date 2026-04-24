import React, { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Switch, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronRight, Fingerprint, LogOut, Shield, User } from "lucide-react-native";
import { ZP } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { isBiometricEnabled, setBiometricEnabled, biometricSupport, logout } from "../../lib/auth";
import { getEmail, getMerchantId } from "../../lib/session";
import { useAppMode } from "../../lib/app-mode";

export function MerchantSettingsScreen() {
  const nav = useNavigation();
  const { setMode } = useAppMode();
  const [email, setEmail] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioOn, setBioOn] = useState(false);

  useEffect(() => {
    (async () => {
      setEmail((await getEmail()) ?? "");
      setMerchantId((await getMerchantId()) ?? "");
      const bio = await biometricSupport();
      setBioAvailable(bio.available);
      setBioOn(await isBiometricEnabled());
    })();
  }, []);

  const toggleBio = async (v: boolean) => {
    await setBiometricEnabled(v);
    setBioOn(v);
  };

  const signOut = async () => {
    await logout();
    await setMode("merchant");
    nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Settings" onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <BankingCard>
          <Row icon={<User size={16} color={ZP.muted} />} label="Email" value={email || "—"} mono />
          <Row icon={<Shield size={16} color={ZP.muted} />} label="Merchant id" value={merchantId || "—"} mono />
        </BankingCard>

        {bioAvailable && (
          <BankingCard>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Fingerprint size={18} color={ZP.violet} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 14, color: ZP.text }}>Biometric unlock</Text>
                <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, marginTop: 2 }}>
                  Require Face ID / Touch ID on every app launch.
                </Text>
              </View>
              <Switch value={bioOn} onValueChange={toggleBio} trackColor={{ true: ZP.cyan, false: ZP.bg3 }} />
            </View>
          </BankingCard>
        )}

        <BankingCard padding={0}>
          <Pressable onPress={signOut}>
            {({ pressed }) => (
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 12,
                padding: 16,
                backgroundColor: pressed ? ZP.dangerBg : "transparent",
              }}>
                <LogOut size={18} color={ZP.danger} />
                <Text style={{ flex: 1, fontFamily: ZP.font.sansSemi, fontSize: 14, color: ZP.danger }}>Sign out</Text>
                <ChevronRight size={16} color={ZP.danger} />
              </View>
            )}
          </Pressable>
        </BankingCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 10,
      paddingVertical: 10, borderTopWidth: 1, borderTopColor: ZP.border,
    }}>
      {icon}
      <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 11, color: ZP.muted, letterSpacing: 0.8, textTransform: "uppercase", width: 110 }}>{label}</Text>
      <Text style={{
        flex: 1, textAlign: "right",
        fontFamily: mono ? ZP.font.mono : ZP.font.sansSemi,
        fontSize: 13, color: ZP.text,
      }} numberOfLines={1}>{value}</Text>
    </View>
  );
}
