// Home — balance hero, quick actions, recent activity, agent treasury tile.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Bell, Bot, CreditCard, Plus, SendHorizontal, Wallet } from "lucide-react-native";
import { ZP, fmtMoney } from "../constants/brand";
import { BankingCard } from "../components/ui/BankingCard";
import { BalanceAmount } from "../components/ui/BalanceAmount";
import { GradientButton } from "../components/ui/GradientButton";
import { api } from "../lib/api";
import { getEmail } from "../lib/session";

interface Account { id: string; account_name: string; balance: number; currency: string; is_primary: boolean }
interface ActivityRow {
  id: string; date: string; amount: number; currency: string;
  description: string; counterparty: string; direction: "in" | "out"; status: string;
}

export function HomeScreen({ goAgents, goWallets, goApprovals }: {
  goAgents: () => void;
  goWallets: () => void;
  goApprovals: () => void;
}) {
  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [feed, approvals, email] = await Promise.all([
        api<{ activity: ActivityRow[] }>("/api/zenipay/merchant-activity?limit=10", { merchantScoped: true }).catch(() => ({ activity: [] })),
        api<{ approvals: Array<{ status: string }> }>("/api/v1/agents/approvals?status=pending", { agentsScoped: true }).catch(() => ({ approvals: [] })),
        getEmail(),
      ]);
      setActivity(feed.activity ?? []);
      setPending((approvals.approvals ?? []).length);
      if (email) setName(email.split("@")[0] ?? "");
      const banking = await api<{ accounts: Account[] }>(`/api/zenipay/banking-ops`, { merchantScoped: true }).catch(() => ({ accounts: [] as Account[] }));
      setAccounts((banking.accounts ?? []).filter((a: Account) => a.balance !== undefined));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const totalBalance = useMemo(() => accounts.reduce((s, a) => s + Number(a.balance || 0), 0), [accounts]);
  const currency = accounts[0]?.currency ?? "CAD";
  const greet = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const first = (name.charAt(0).toUpperCase() + name.slice(1)).split(".")[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: ZP.muted, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" }}>{greet}</Text>
            <Text style={{ fontSize: 22, fontWeight: "800", color: ZP.text, marginTop: 2, letterSpacing: -0.5 }}>{first || "There"} 👋</Text>
          </View>
          <View style={{ position: "relative" }}>
            <Bell size={22} color={ZP.muted} />
            {pending > 0 && (
              <View style={{
                position: "absolute", right: -4, top: -4, minWidth: 18, height: 18, borderRadius: 9,
                backgroundColor: ZP.danger, alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
              }}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>{pending}</Text>
              </View>
            )}
          </View>
        </View>

        <BankingCard accent="cyan" padding={22}>
          <Text style={{ fontSize: 10, color: ZP.muted, fontWeight: "800", letterSpacing: 1.1, textTransform: "uppercase" }}>
            Total balance
          </Text>
          {loading && accounts.length === 0 ? (
            <Text style={{ marginTop: 8, color: ZP.muted }}>Loading…</Text>
          ) : (
            <BalanceAmount amount={totalBalance} currency={currency} size="xl" style={{ marginTop: 6 }} />
          )}
          <Text style={{ marginTop: 6, color: ZP.muted, fontSize: 12 }}>
            {accounts.length} account{accounts.length === 1 ? "" : "s"} · {currency}
          </Text>
        </BankingCard>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
          <QuickAction icon={<Plus size={18} color="#fff" />} label="Fund treasury" onPress={goAgents} />
          <QuickAction icon={<SendHorizontal size={18} color="#fff" />} label="Send" onPress={goWallets} />
          <QuickAction icon={<Wallet size={18} color="#fff" />} label="Receive" onPress={goWallets} />
          <QuickAction icon={<CreditCard size={18} color="#fff" />} label="Cards" onPress={goWallets} />
        </View>

        <Text style={sectionHdr}>Recent activity</Text>
        {activity.length === 0 ? (
          <BankingCard>
            <Text style={{ fontSize: 13, color: ZP.muted }}>
              Nothing yet. Once you fund treasury or accept a payment, you’ll see it here.
            </Text>
          </BankingCard>
        ) : (
          <BankingCard padding={0}>
            {activity.slice(0, 5).map((row, i) => (
              <View key={row.id} style={{
                flexDirection: "row", alignItems: "center", padding: 14,
                borderTopWidth: i === 0 ? 0 : 1, borderTopColor: ZP.border,
              }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: ZP.text }}>{row.description}</Text>
                  <Text style={{ fontSize: 11, color: ZP.muted, marginTop: 2 }}>
                    {row.counterparty} · {new Date(row.date).toLocaleDateString("en-CA")}
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14, fontWeight: "800",
                  color: row.direction === "in" ? ZP.success : ZP.text,
                  fontVariant: ["tabular-nums"], fontFamily: "Menlo",
                }}>
                  {row.direction === "in" ? "+" : "−"}{fmtMoney(row.amount, row.currency)}
                </Text>
              </View>
            ))}
          </BankingCard>
        )}

        <BankingCard accent="violet" style={{ marginTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: "rgba(123,79,191,0.12)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={20} color={ZP.violet} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: ZP.text }}>AI Agent Treasury</Text>
              <Text style={{ fontSize: 11, color: ZP.muted, marginTop: 2 }}>
                Fund the org treasury and distribute to individual agents.
              </Text>
            </View>
            <GradientButton label="Open" size="sm" onPress={goAgents} />
          </View>
        </BankingCard>

        {pending > 0 && (
          <BankingCard accent="pink" style={{ marginTop: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: ZP.text }}>
                  {pending} approval{pending === 1 ? "" : "s"} pending
                </Text>
                <Text style={{ fontSize: 11, color: ZP.muted, marginTop: 2 }}>
                  Review and decide in one tap.
                </Text>
              </View>
              <GradientButton label="Review" size="sm" onPress={goApprovals} />
            </View>
          </BankingCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <GradientButton label={label} icon={icon} onPress={onPress} size="sm" fullWidth />
    </View>
  );
}

const sectionHdr = {
  marginTop: 22, marginBottom: 10,
  fontSize: 14, fontWeight: "800" as const, color: ZP.text,
};
