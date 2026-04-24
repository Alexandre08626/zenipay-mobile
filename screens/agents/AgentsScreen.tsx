import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Plus, Search } from "lucide-react-native";
import { ZP, fmtMoney } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { AgentAvatar } from "../../components/ui/AgentAvatar";
import { GradientButton } from "../../components/ui/GradientButton";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { api } from "../../lib/api";
import type { RootStackParamList } from "../../navigation/RootNavigator";

interface Agent { id: string; name: string; agent_type: string; wallet_balance_cents: number; currency: string }

export function AgentsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await api<{ agents: Agent[] }>("/api/v1/agents/agents-with-balances", { agentsScoped: true });
      setAgents(r.agents ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = agents.filter((a) =>
    !q || a.name.toLowerCase().includes(q.toLowerCase()) || a.agent_type.toLowerCase().includes(q.toLowerCase())
  );
  const totalBal = agents.reduce((s, a) => s + (a.wallet_balance_cents ?? 0), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader
        title="Agents"
        subtitle={`${agents.length} agent${agents.length === 1 ? "" : "s"} · ${fmtMoney(totalBal / 100, agents[0]?.currency ?? "CAD")} total`}
        right={<GradientButton size="sm" label="New" icon={<Plus size={12} color="#fff" />} />}
      />

      <View style={{
        marginHorizontal: 16, marginBottom: 10,
        flexDirection: "row", alignItems: "center", gap: 8,
        paddingHorizontal: 12, paddingVertical: 10,
        borderRadius: 12, borderWidth: 1, borderColor: ZP.border, backgroundColor: ZP.bg2,
      }}>
        <Search size={16} color={ZP.muted} />
        <TextInput
          placeholder="Search agents or roles"
          placeholderTextColor={ZP.dim}
          value={q} onChangeText={setQ}
          style={{ flex: 1, fontFamily: ZP.font.sans, fontSize: 13, color: ZP.text }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 48, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={ZP.violet} />}
      >
        {loading && agents.length === 0 ? (
          <>
            <SkeletonCard /><SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState title="No agents" subtitle={q ? "No matches." : "Create an agent from the web dashboard to get started."} />
        ) : (
          filtered.map((a) => (
            <BankingCard key={a.id} padding={16}>
              <View
                onTouchEnd={() => nav.navigate("AgentDetail", { id: a.id })}
                style={{ flexDirection: "row", alignItems: "center", gap: 14 }}
              >
                <AgentAvatar name={a.name} size={52} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 16, color: ZP.text }}>{a.name}</Text>
                  <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, textTransform: "capitalize", marginTop: 3 }}>
                    {a.agent_type.replace(/_/g, " ")}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 10, color: ZP.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>Balance</Text>
                  <Text style={{ fontFamily: ZP.font.monoMed, fontSize: 16, color: ZP.text, marginTop: 2 }}>
                    {fmtMoney(a.wallet_balance_cents / 100, a.currency)}
                  </Text>
                </View>
              </View>
            </BankingCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
