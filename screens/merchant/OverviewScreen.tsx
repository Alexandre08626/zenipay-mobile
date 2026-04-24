import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Bell, Briefcase, ChevronRight, CreditCard, FileText, Receipt, SendHorizontal, Wallet } from "lucide-react-native";
import { ZP, fmtMoney } from "../../constants/brand";
import { BankingCard } from "../../components/ui/BankingCard";
import { BalanceAmount } from "../../components/ui/BalanceAmount";
import { GradientButton } from "../../components/ui/GradientButton";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { DataRow } from "../../components/ui/DataRow";
import { SkeletonCard, SkeletonRow } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ModeSwitcher } from "../../components/ui/ModeSwitcher";
import { api } from "../../lib/api";
import { getEmail } from "../../lib/session";
import type { RootStackParamList } from "../../navigation/RootNavigator";

interface Account { id: string; account_name: string; balance: number; currency: string; is_primary: boolean; status: string }
interface ActivityRow {
  id: string; date: string; amount: number; currency: string;
  description: string; counterparty: string; direction: "in" | "out"; status: string;
  kind: string;
}

export function OverviewScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [banking, feed, approvals, email] = await Promise.all([
        api<{ accounts: Account[] }>("/api/zenipay/banking-ops", { merchantScoped: true }).catch(() => ({ accounts: [] as Account[] })),
        api<{ activity: ActivityRow[] }>("/api/zenipay/merchant-activity?limit=8", { merchantScoped: true }).catch(() => ({ activity: [] })),
        api<{ approvals: unknown[] }>("/api/v1/agents/approvals?status=pending", { agentsScoped: true }).catch(() => ({ approvals: [] })),
        getEmail(),
      ]);
      setAccounts((banking.accounts ?? []).filter((a) => a.status !== "closed"));
      setActivity(feed.activity ?? []);
      setPending(approvals.approvals?.length ?? 0);
      if (email) setName(((email.split("@")[0] ?? "").split(".")[0] ?? "").replace(/^\w/, (c) => c.toUpperCase()));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const total = accounts.reduce((s, a) => s + Number(a.balance || 0), 0);
  const currency = accounts[0]?.currency ?? "CAD";
  const greet = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={ZP.cyan} />}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4, marginBottom: 18 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted }}>{greet}</Text>
            <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 22, color: ZP.text, marginTop: 2, letterSpacing: -0.5 }}>
              {name || "there"} 👋
            </Text>
          </View>
          <View style={{ position: "relative" }}>
            <Bell size={20} color={ZP.muted} />
            {pending > 0 && (
              <View style={{
                position: "absolute", right: -6, top: -4, minWidth: 16, height: 16, borderRadius: 8,
                backgroundColor: ZP.danger, alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
              }}>
                <Text style={{ color: "#fff", fontSize: 9, fontFamily: ZP.font.sansBold }}>{pending}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ alignSelf: "flex-start", marginBottom: 14 }}>
          <ModeSwitcher />
        </View>

        {/* Balance hero */}
        {loading && accounts.length === 0 ? (
          <SkeletonCard />
        ) : (
          <BankingCard accent="cyan" padding={22}>
            <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 10, color: ZP.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>
              Total balance
            </Text>
            <BalanceAmount amount={total} currency={currency} size="hero" style={{ marginTop: 6 }} />
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, marginTop: 6 }}>
              {accounts.length} account{accounts.length === 1 ? "" : "s"} · {currency}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
              <GradientButton label="Send" size="sm" icon={<SendHorizontal size={13} color="#fff" />} onPress={() => (nav as unknown as { jumpTo: (s: string) => void }).jumpTo?.("Transfer")} />
              <GradientButton label="Cards" size="sm" variant="ghost" icon={<CreditCard size={13} color={ZP.text} />} onPress={() => (nav as unknown as { jumpTo: (s: string) => void }).jumpTo?.("Cards")} />
              <GradientButton label="Invoices" size="sm" variant="ghost" icon={<FileText size={13} color={ZP.text} />} onPress={() => nav.navigate("Invoices")} />
            </View>
          </BankingCard>
        )}

        {/* Quick stats */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <StatTile icon={<Briefcase size={14} color={ZP.violet} />} label="Pending" value={String(pending)} />
          <StatTile icon={<Receipt size={14} color={ZP.cyan} />} label="Accounts" value={String(accounts.length)} />
          <StatTile icon={<Wallet size={14} color={ZP.green} />} label="Total" value={fmtMoney(total, currency)} />
        </View>

        {/* Recent activity */}
        <SectionHeader title="Recent activity" action="See all →" onActionPress={() => nav.navigate("Transactions")} />
        {loading && activity.length === 0 ? (
          <BankingCard padding={0}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </BankingCard>
        ) : activity.length === 0 ? (
          <EmptyState
            icon={<Receipt size={24} color={ZP.muted} />}
            title="No activity yet"
            subtitle="Once you fund treasury or accept a payment, you'll see it here."
          />
        ) : (
          <BankingCard padding={0}>
            {activity.slice(0, 5).map((a) => (
              <View key={a.id} style={{ borderTopWidth: a === activity[0] ? 0 : 1, borderTopColor: ZP.border }}>
                <DataRow
                  icon={<SendHorizontal size={16} color={a.direction === "in" ? ZP.success : ZP.muted} />}
                  title={a.description}
                  subtitle={a.counterparty}
                  right={
                    <Text style={{
                      fontFamily: ZP.font.monoMed, fontSize: 14,
                      color: a.direction === "in" ? ZP.success : ZP.text,
                      fontVariant: ["tabular-nums"] as const,
                    }}>
                      {a.direction === "in" ? "+" : "−"}{fmtMoney(Math.abs(a.amount), a.currency)}
                    </Text>
                  }
                  rightSub={new Date(a.date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                  onPress={() => nav.navigate("TransactionDetail", { id: a.id })}
                />
              </View>
            ))}
          </BankingCard>
        )}

        {/* Agent treasury link */}
        <BankingCard accent="violet" style={{ marginTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: "rgba(123,79,191,0.12)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Briefcase size={20} color={ZP.violet} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 14, color: ZP.text }}>AI Agent Treasury</Text>
              <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, marginTop: 2 }}>
                Fund once, distribute to any agent.
              </Text>
            </View>
            <ChevronRight size={18} color={ZP.muted} />
          </View>
        </BankingCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={{
      flex: 1, backgroundColor: "#fff",
      borderRadius: 14, borderWidth: 1, borderColor: ZP.border,
      padding: 12, gap: 6,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {icon}
        <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 10, color: ZP.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>{label}</Text>
      </View>
      <Text style={{ fontFamily: ZP.font.monoMed, fontSize: 14, color: ZP.text }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
