// Agents — treasury balance + fleet list.

import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { ZP, fmtMoney } from "../constants/brand";
import { BankingCard } from "../components/ui/BankingCard";
import { BalanceAmount } from "../components/ui/BalanceAmount";
import { AgentAvatar } from "../components/ui/AgentAvatar";
import { GradientButton } from "../components/ui/GradientButton";
import { api } from "../lib/api";

interface Snapshot { currency: string; treasury_micro: string; agents_allocated_micro: string }
interface AgentBalance {
  id: string; name: string; agent_type: string;
  wallet_balance_cents: number; currency: string;
}

export function AgentsScreen({ onOpenAgent }: { onOpenAgent: (a: AgentBalance) => void }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [agents, setAgents] = useState<AgentBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ledger, agentList] = await Promise.all([
        api<{ snapshot: Snapshot[] }>("/api/v1/agents/ledger", { agentsScoped: true }).catch(() => ({ snapshot: [] })),
        api<{ agents: AgentBalance[] }>("/api/v1/agents/agents-with-balances", { agentsScoped: true }).catch(() => ({ agents: [] })),
      ]);
      setSnapshots(ledger.snapshot ?? []);
      setAgents(agentList.agents ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const primary = snapshots.find((s) => BigInt(s.treasury_micro || "0") > BigInt(0)) ?? snapshots[0];
  const treasuryCurrency = primary?.currency ?? "CAD";
  const treasuryAmount = primary
    ? Number(BigInt(primary.treasury_micro || "0") / BigInt(10_000)) / 100
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <Text style={{ fontSize: 24, fontWeight: "800", color: ZP.text, letterSpacing: -0.5, marginBottom: 14 }}>
          AI Agent Treasury
        </Text>

        <BankingCard accent="violet" padding={22}>
          <Text style={{ fontSize: 10, fontWeight: "800", color: ZP.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>
            Treasury balance
          </Text>
          <BalanceAmount amount={treasuryAmount} currency={treasuryCurrency} size="xl" style={{ marginTop: 6 }} />
          <Text style={{ fontSize: 12, color: ZP.muted, marginTop: 6 }}>
            Fund once. Distribute to any agent.
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <GradientButton label="Fund treasury" size="sm" onPress={() => { /* TODO: fund sheet */ }} />
            <GradientButton label="Distribute" variant="ghost" size="sm" onPress={() => { /* TODO */ }} />
          </View>
        </BankingCard>

        <Text style={{ marginTop: 24, marginBottom: 10, fontSize: 14, fontWeight: "800", color: ZP.text }}>
          Agents ({agents.length})
        </Text>

        {loading && agents.length === 0 ? (
          <BankingCard><Text style={{ color: ZP.muted }}>Loading…</Text></BankingCard>
        ) : agents.length === 0 ? (
          <BankingCard>
            <Text style={{ color: ZP.muted }}>
              No agents yet. Head to the web app to create your first one.
            </Text>
          </BankingCard>
        ) : (
          <View style={{ gap: 10 }}>
            {agents.map((a) => (
              <BankingCard key={a.id} padding={14}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <AgentAvatar name={a.name} size={44} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: ZP.text }}>{a.name}</Text>
                    <Text style={{ fontSize: 11, color: ZP.muted, textTransform: "capitalize", marginTop: 2 }}>
                      {a.agent_type.replace(/_/g, " ")}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 14, fontWeight: "800", color: ZP.text,
                    fontVariant: ["tabular-nums"], fontFamily: "Menlo",
                  }}>
                    {fmtMoney(a.wallet_balance_cents / 100, a.currency)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 10 }}>
                  <GradientButton label="Open" size="sm" variant="ghost" onPress={() => onOpenAgent(a)} />
                  <GradientButton label="Distribute" size="sm" onPress={() => { /* TODO distribute sheet */ }} />
                </View>
              </BankingCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
