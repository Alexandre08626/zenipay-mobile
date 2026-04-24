import React from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Activity, CheckSquare, ChevronRight, CreditCard, LogOut, Settings as SettingsIcon, Shield, ShieldCheck } from "lucide-react-native";
import { ZP } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { ModeSwitcher } from "../../components/ui/ModeSwitcher";
import { logout } from "../../lib/auth";
import { useAppMode } from "../../lib/app-mode";
import type { RootStackParamList } from "../../navigation/RootNavigator";

export function MoreAgentsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setMode } = useAppMode();

  const signOut = async () => { await logout(); await setMode("agents"); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="More" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ alignSelf: "flex-start" }}><ModeSwitcher /></View>

        <BankingCard padding={0}>
          <Item icon={<CreditCard size={18} color={ZP.violet} />} label="ZeniCards" onPress={() => nav.navigate("ZeniCards")} />
          <Item icon={<CheckSquare size={18} color={ZP.violet} />} label="Approvals" onPress={() => nav.navigate("Approvals")} />
          <Item icon={<Shield size={18} color={ZP.violet} />} label="Fraud" onPress={() => nav.navigate("Audit")} />
          <Item icon={<Activity size={18} color={ZP.violet} />} label="Audit trail" onPress={() => nav.navigate("Audit")} />
          <Item icon={<ShieldCheck size={18} color={ZP.violet} />} label="Compliance" onPress={() => nav.navigate("Compliance")} />
          <Item icon={<SettingsIcon size={18} color={ZP.violet} />} label="Settings" onPress={() => nav.navigate("AgentsSettings")} />
        </BankingCard>

        <BankingCard padding={0}>
          <Item icon={<LogOut size={18} color={ZP.danger} />} label="Sign out" danger onPress={signOut} />
        </BankingCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Item({ icon, label, danger, onPress }: { icon: React.ReactNode; label: string; danger?: boolean; onPress: () => void | Promise<void> }) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 12,
          paddingHorizontal: 16, paddingVertical: 14,
          borderBottomWidth: 1, borderBottomColor: ZP.border,
          backgroundColor: pressed ? ZP.bg2 : "transparent",
        }}>
          {icon}
          <Text style={{ flex: 1, fontFamily: ZP.font.sansSemi, fontSize: 14, color: danger ? ZP.danger : ZP.text }}>{label}</Text>
          <ChevronRight size={16} color={ZP.dim} />
        </View>
      )}
    </Pressable>
  );
}
