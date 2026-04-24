import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Eye, EyeOff, Plus, SendHorizontal, Wallet } from "lucide-react-native";
import { ZP, maskAccount } from "../../constants/brand";
import { BankingCard } from "../../components/ui/BankingCard";
import { BalanceAmount } from "../../components/ui/BalanceAmount";
import { GradientButton } from "../../components/ui/GradientButton";
import { StatusPill } from "../../components/ui/StatusPill";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { api } from "../../lib/api";
import type { RootStackParamList } from "../../navigation/RootNavigator";

interface Account {
  id: string; account_type: string; account_name: string; account_number: string;
  routing_number: string; balance: number; currency: string; is_primary: boolean; status: string;
}

export function AccountsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ accounts: Account[] }>("/api/zenipay/banking-ops", { merchantScoped: true });
      setAccounts((r.accounts ?? []).filter((a) => a.status !== "closed"));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Accounts" right={<GradientButton size="sm" label="New" icon={<Plus size={12} color="#fff" />} />} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={ZP.cyan} />}
      >
        {loading && accounts.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : accounts.length === 0 ? (
          <EmptyState
            icon={<Wallet size={28} color={ZP.muted} />}
            title="No accounts yet"
            subtitle="Open a ZeniPay business account to start receiving payments and sending transfers."
          />
        ) : (
          accounts.map((a) => {
            const isSavings = a.account_type?.includes("savings");
            const show = !!reveal[a.id];
            return (
              <BankingCard key={a.id} accent={isSavings ? "violet" : "cyan"} padding={18}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {a.is_primary && <StatusPill status="info" label="Primary" />}
                  <StatusPill status="info" label={isSavings ? "Savings" : "Checking"} />
                  <StatusPill status="active" label={a.status} />
                </View>
                <Pressable onPress={() => nav.navigate("AccountDetail", { id: a.id })}>
                  <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 17, color: ZP.text, letterSpacing: -0.3 }}>
                    {a.account_name}
                  </Text>
                  <BalanceAmount amount={Number(a.balance || 0)} currency={a.currency || "CAD"} size="xl" style={{ marginTop: 6 }} />
                </Pressable>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 6 }}>
                  <Text style={{
                    fontFamily: ZP.font.monoMed, fontSize: 12, color: ZP.muted,
                    fontVariant: ["tabular-nums"] as const,
                  }}>
                    {show ? a.account_number : maskAccount(a.account_number)}
                  </Text>
                  <Pressable
                    onPress={() => setReveal((s) => ({ ...s, [a.id]: !s[a.id] }))}
                    style={{ padding: 4 }}
                  >
                    {show ? <EyeOff size={13} color={ZP.muted} /> : <Eye size={13} color={ZP.muted} />}
                  </Pressable>
                </View>

                <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                  <GradientButton size="sm" label="Send" icon={<SendHorizontal size={11} color="#fff" />} />
                  <GradientButton size="sm" variant="secondary" label="Details" onPress={() => nav.navigate("AccountDetail", { id: a.id })} />
                </View>
              </BankingCard>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
