import React from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ChevronRight, ArrowLeftRight, FileText, Link as LinkIcon, Users, Settings as SettingsIcon, LogOut,
} from "lucide-react-native";
import { ZP } from "../../constants/brand";
import { BankingCard } from "../../components/ui/BankingCard";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { ModeSwitcher } from "../../components/ui/ModeSwitcher";
import { logout } from "../../lib/auth";
import type { RootStackParamList } from "../../navigation/RootNavigator";
import { useAppMode } from "../../lib/app-mode";

export function MoreMerchantScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setMode } = useAppMode();

  const signOut = async () => {
    await logout();
    await setMode("merchant"); // reset; next boot returns to LoginScreen anyway
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="More" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ alignSelf: "flex-start" }}><ModeSwitcher /></View>

        <BankingCard padding={0}>
          <Item icon={<ArrowLeftRight size={18} color={ZP.cyan} />} label="Transactions"  onPress={() => nav.navigate("Transactions")} />
          <Item icon={<FileText size={18} color={ZP.cyan} />}       label="Invoices"      onPress={() => nav.navigate("Invoices")} />
          <Item icon={<LinkIcon size={18} color={ZP.cyan} />}       label="Payment links" onPress={() => nav.navigate("PaymentLinks")} />
          <Item icon={<Users size={18} color={ZP.cyan} />}          label="Contacts"      onPress={() => nav.navigate("Contacts")} />
          <Item icon={<SettingsIcon size={18} color={ZP.cyan} />}   label="Settings"      onPress={() => nav.navigate("MerchantSettings")} />
        </BankingCard>

        <BankingCard padding={0}>
          <Item icon={<LogOut size={18} color={ZP.danger} />} label="Sign out" danger onPress={signOut} />
        </BankingCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Item({
  icon, label, danger, onPress,
}: { icon: React.ReactNode; label: string; danger?: boolean; onPress: () => void | Promise<void> }) {
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
          <Text style={{
            flex: 1, fontFamily: ZP.font.sansSemi, fontSize: 14,
            color: danger ? ZP.danger : ZP.text,
          }}>
            {label}
          </Text>
          <ChevronRight size={16} color={ZP.dim} />
        </View>
      )}
    </Pressable>
  );
}
