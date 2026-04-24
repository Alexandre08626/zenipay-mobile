import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ZP, fmtMoney } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { BalanceAmount } from "../../components/ui/BalanceAmount";
import { AgentAvatar } from "../../components/ui/AgentAvatar";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";
import { api } from "../../lib/api";

interface Agent { id: string; name: string; agent_type: string; wallet_balance_cents: number; currency: string }

export function AgentDetailScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const id = (route.params as { id: string }).id;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api<{ agents: Agent[] }>("/api/v1/agents/agents-with-balances", { agentsScoped: true });
      setAgent(r.agents?.find((a) => a.id === id) ?? null);
    } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title={agent?.name ?? "Agent"} onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {loading ? (
          <SkeletonCard />
        ) : agent ? (
          <>
            <BankingCard accent="violet" padding={24}>
              <View style={{ alignItems: "center", gap: 12 }}>
                <AgentAvatar name={agent.name} size={80} />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 22, color: ZP.text }}>{agent.name}</Text>
                  <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, textTransform: "capitalize", marginTop: 4 }}>
                    {agent.agent_type.replace(/_/g, " ")}
                  </Text>
                </View>
                <BalanceAmount amount={agent.wallet_balance_cents / 100} currency={agent.currency} size="xl" style={{ marginTop: 6 }} />
              </View>
            </BankingCard>
            <BankingCard>
              <Text style={{ fontFamily: ZP.font.sans, fontSize: 13, color: ZP.muted, lineHeight: 18 }}>
                Agent transaction history and per-agent cards ship in the next release. Use the web dashboard at{" "}
                <Text style={{ color: ZP.violet, fontFamily: ZP.font.sansSemi }}>/agents/agents/{agent.id.slice(0, 12)}…</Text> for the full view.
              </Text>
            </BankingCard>
          </>
        ) : (
          <BankingCard><Text style={{ color: ZP.muted }}>Agent not found.</Text></BankingCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Silence unused
void fmtMoney;
