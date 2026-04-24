import React from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Building2, Bot } from "lucide-react-native";
import { ZP } from "../constants/brand";
import { useAppMode } from "../lib/app-mode";

export function ModeSelectorScreen() {
  const { setMode } = useAppMode();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 40, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 28, color: ZP.text, letterSpacing: -0.6, textAlign: "center" }}>
            Choose your experience
          </Text>
          <Text style={{ fontFamily: ZP.font.sans, fontSize: 14, color: ZP.muted, marginTop: 8, textAlign: "center" }}>
            You can switch anytime from the header.
          </Text>
        </View>

        <Card
          accent={[ZP.cyan, ZP.cyan]}
          icon={<Building2 size={28} color={ZP.cyan} />}
          title="Merchant Banking"
          subtitle="Manage business accounts, send payments, issue cards, track finances."
          onPress={() => setMode("merchant")}
        />

        <View style={{ height: 12 }} />

        <Card
          accent={[ZP.violet, ZP.violet]}
          icon={<Bot size={28} color={ZP.violet} />}
          title="AI Agent Wallet"
          subtitle="Monitor your AI fleet, distribute funds, manage agent wallets and spending."
          onPress={() => setMode("agents")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({
  accent, icon, title, subtitle, onPress,
}: {
  accent: [string, string];
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: pressed ? accent[0] : ZP.border,
          padding: 22,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          shadowColor: "#0f172a",
          shadowOpacity: pressed ? 0.14 : 0.08,
          shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
          transform: [{ scale: pressed ? 0.985 : 1 }],
        }}>
          <LinearGradient
            colors={[`${accent[0]}15`, `${accent[0]}05`] as [string, string]}
            style={{
              width: 64, height: 64, borderRadius: 18,
              alignItems: "center", justifyContent: "center",
              borderWidth: 1, borderColor: `${accent[0]}30`,
            }}
          >
            {icon}
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 17, color: ZP.text, letterSpacing: -0.2 }}>
              {title}
            </Text>
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, marginTop: 4, lineHeight: 17 }}>
              {subtitle}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
