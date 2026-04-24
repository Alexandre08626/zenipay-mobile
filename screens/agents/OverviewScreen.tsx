import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Bell, BookOpen, CheckSquare, Shield, Vault } from "lucide-react-native";
import { ZP, fmtMoney } from "../../constants/brand";
import { BankingCard } from "../../components/ui/BankingCard";
import { BalanceAmount } from "../../components/ui/BalanceAmount";
import { GradientButton } from "../../components/ui/GradientButton";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { DataRow } from "../../components/ui/DataRow";
import { AgentAvatar } from "../../components/ui/AgentAvatar";
import { SkeletonCard, SkeletonRow } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { ModeSwitcher } from "../../components/ui/ModeSwitcher";
import { api } from "../../lib/api";
import type { RootStackParamList } from "../../navigation/RootNavigator";

interface Snapshot { currency: string; treasury_micro: string }
interface Agent { id: string; name: string; agent_type: string; wallet_balance_cents: number; currency: string }
interface Entry { id: string; amount_micro: string | number; currency: string; direction: "debit" | "credit"; memo: string; posted_at: string }

export function AgentsOverviewScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pending, setPending] = useState(0);
  const [chainOk, setChainOk] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ledger, agentList, approvals] = await Promise.all([
        api<{
          snapshot: Snapshot[];
          entries?: Entry[];
          integrity?: { is_intact: boolean };
        }>("/api/v1/agents/ledger", { agentsScoped: true }).catch(() => ({ snapshot: [], entries: [], integrity: { is_intact: true } })),
        api<{ agents: Agent[] }>("/api/v1/agents/agents-with-balances", { agentsScoped: true }).catch(() => ({ agents: [] })),
        api<{ approvals: unknown[] }>("/api/v1/agents/approvals?status=pending", { agentsScoped: true }).catch(() => ({ approvals: [] })),
      ]);
      setSnapshots(ledger.snapshot ?? []);
      setEntries(ledger.entries ?? []);
      setChainOk(!!ledger.integrity?.is_intact);
      setAgents(agentList.agents ?? []);
      setPending(approvals.approvals?.length ?? 0);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  // Auto-refresh ledger every 15s while screen is foregrounded.
  useEffect(() => {
    const i = setInterval(() => { void load(); }, 15_000);
    return () => clearInterval(i);
  }, [load]);

  const primary = snapshots.find((s) => BigInt(s.treasury_micro || "0") > BigInt(0)) ?? snapshots[0];
  const treasuryAmount = primary ? Number(BigInt(primary.treasury_micro || "0") / BigInt(10_000)) / 100 : 0;
  const treasuryCurrency = primary?.currency ?? "CAD";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={ZP.violet} />}
      >
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 4, marginBottom: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 22, color: ZP.text, letterSpacing: -0.5 }}>Agent platform</Text>
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, marginTop: 2 }}>
              Fleet overview · ZeniCore live
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

        {loading && snapshots.length === 0 ? (
          <SkeletonCard />
        ) : (
          <BankingCard accent="violet" padding={22}>
            <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 10, color: ZP.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>
              Agent treasury
            </Text>
            <BalanceAmount amount={treasuryAmount} currency={treasuryCurrency} size="hero" style={{ marginTop: 6 }} />
            <View style={{ flexDirection: "row", gap: 6, alignItems: "center", marginTop: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: chainOk ? ZP.success : ZP.danger }} />
              <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted }}>
                Chain {chainOk ? "verified" : "broken"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
              <GradientButton label="Distribute" size="sm" icon={<Vault size={13} color="#fff" />} />
              <GradientButton label="View ledger" size="sm" variant="ghost" icon={<BookOpen size={13} color={ZP.text} />} />
            </View>
          </BankingCard>
        )}

        <SectionHeader title={`Your fleet · ${agents.length}`} action="All agents →" />
        {loading && agents.length === 0 ? (
          <View style={{ gap: 10 }}>
            <SkeletonCard />
          </View>
        ) : agents.length === 0 ? (
          <EmptyState icon={<CheckSquare size={24} color={ZP.muted} />} title="No agents yet" subtitle="Create your first agent from the web dashboard." />
        ) : (
          <View style={{ gap: 8 }}>
            {agents.slice(0, 4).map((a) => (
              <BankingCard key={a.id} padding={14}>
                <View
                  onTouchEnd={() => nav.navigate("AgentDetail", { id: a.id })}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
                >
                  <AgentAvatar name={a.name} size={44} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 15, color: ZP.text }}>{a.name}</Text>
                    <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, textTransform: "capitalize", marginTop: 2 }}>
                      {a.agent_type.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: ZP.font.monoMed, fontSize: 14, color: ZP.text, fontVariant: ["tabular-nums"] as const }}>
                    {fmtMoney(a.wallet_balance_cents / 100, a.currency)}
                  </Text>
                </View>
              </BankingCard>
            ))}
          </View>
        )}

        <SectionHeader title="Recent ledger activity" action="See all →" />
        {loading && entries.length === 0 ? (
          <BankingCard padding={0}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
          </BankingCard>
        ) : entries.length === 0 ? (
          <EmptyState icon={<BookOpen size={24} color={ZP.muted} />} title="Ledger is empty" subtitle="Fund the treasury to post the first entry." />
        ) : (
          <BankingCard padding={0}>
            {entries.slice(0, 5).map((e) => (
              <View key={e.id} style={{ borderTopWidth: e === entries[0] ? 0 : 1, borderTopColor: ZP.border }}>
                <DataRow
                  icon={<BookOpen size={14} color={e.direction === "credit" ? ZP.success : ZP.muted} />}
                  title={e.memo || "ZeniCore entry"}
                  subtitle={new Date(e.posted_at).toLocaleString()}
                  right={
                    <Text style={{
                      fontFamily: ZP.font.monoMed, fontSize: 13,
                      color: e.direction === "credit" ? ZP.success : ZP.text,
                      fontVariant: ["tabular-nums"] as const,
                    }}>
                      {e.direction === "credit" ? "+" : "−"}
                      {fmtMoney(Number(BigInt(e.amount_micro) / BigInt(10_000)) / 100, e.currency)}
                    </Text>
                  }
                />
              </View>
            ))}
          </BankingCard>
        )}

        {pending > 0 && (
          <BankingCard accent="pink" style={{ marginTop: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Shield size={22} color={ZP.pink} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 14, color: ZP.text }}>
                  {pending} approval{pending === 1 ? "" : "s"} pending
                </Text>
                <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted }}>Review and decide in one tap.</Text>
              </View>
              <GradientButton label="Review" size="sm" onPress={() => nav.navigate("Approvals")} />
            </View>
          </BankingCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
