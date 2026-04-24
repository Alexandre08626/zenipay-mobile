import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { ZP, fmtMoney } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { BalanceAmount } from "../../components/ui/BalanceAmount";
import { GradientButton } from "../../components/ui/GradientButton";
import { AgentAvatar } from "../../components/ui/AgentAvatar";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";

interface Snapshot { currency: string; treasury_micro: string }
interface Agent { id: string; name: string; agent_type: string; wallet_balance_cents: number; currency: string }

export function TreasuryScreen() {
  const toast = useToast();
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agentId, setAgentId] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ledger, agentList] = await Promise.all([
        api<{ snapshot: Snapshot[] }>("/api/v1/agents/ledger", { agentsScoped: true }).catch(() => ({ snapshot: [] })),
        api<{ agents: Agent[] }>("/api/v1/agents/agents-with-balances", { agentsScoped: true }).catch(() => ({ agents: [] })),
      ]);
      setSnapshots(ledger.snapshot ?? []);
      setAgents(agentList.agents ?? []);
      if (!agentId && agentList.agents?.[0]) setAgentId(agentList.agents[0].id);
    } finally { setLoading(false); }
  }, [agentId]);
  useEffect(() => { void load(); }, [load]);

  const primary = snapshots.find((s) => BigInt(s.treasury_micro || "0") > BigInt(0)) ?? snapshots[0];
  const treasuryAmount = primary ? Number(BigInt(primary.treasury_micro || "0") / BigInt(10_000)) / 100 : 0;
  const currency = primary?.currency ?? "CAD";
  const picked = agents.find((a) => a.id === agentId);

  const distribute = async () => {
    const amt = Number(amount);
    if (!agentId) { toast.show("Pick an agent.", "error"); return; }
    if (!Number.isFinite(amt) || amt <= 0) { toast.show("Amount must be > 0.", "error"); return; }
    if (amt > treasuryAmount) { toast.show("Insufficient treasury balance.", "error"); return; }
    setSending(true);
    try {
      const res = await api<{ requires_approval?: boolean; approver_name?: string; approver_email?: string }>("/api/v1/agents/treasury/request-distribution", {
        method: "POST",
        agentsScoped: true,
        body: {
          to_agent_id: agentId,
          amount_units: amt,
          currency,
          idempotency_key: `mobile-treas2agent-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          memo,
        },
      });
      if (res.requires_approval) {
        toast.show(`Approval requested from ${res.approver_name ?? res.approver_email ?? "approver"}`, "warning");
      } else {
        toast.show(`${fmtMoney(amt, currency)} sent to ${picked?.name ?? "agent"} ✓`, "success");
      }
      setAmount(""); setMemo("");
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Distribution failed.", "error");
    } finally { setSending(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Treasury" />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 14 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={ZP.violet} />}
        keyboardShouldPersistTaps="handled"
      >
        {loading && snapshots.length === 0 ? (
          <SkeletonCard />
        ) : (
          <BankingCard accent="violet" padding={22}>
            <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 10, color: ZP.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>
              Treasury balance
            </Text>
            <BalanceAmount amount={treasuryAmount} currency={currency} size="hero" style={{ marginTop: 6 }} />
          </BankingCard>
        )}

        <BankingCard>
          <Text style={lbl}>Distribute to agent</Text>
          <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, marginBottom: 10 }}>
            Debit treasury, credit one agent wallet. Idempotent + audited.
          </Text>

          <View style={{ gap: 6, marginBottom: 12 }}>
            {agents.map((a) => {
              const active = a.id === agentId;
              return (
                <View
                  key={a.id}
                  onTouchEnd={() => setAgentId(a.id)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 10,
                    padding: 10, borderRadius: 10,
                    borderWidth: 1.5, borderColor: active ? ZP.violet : ZP.border,
                    backgroundColor: active ? "rgba(123,79,191,0.06)" : "#fff",
                  }}
                >
                  <AgentAvatar name={a.name} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 13, color: ZP.text }}>{a.name}</Text>
                    <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, marginTop: 2 }}>
                      {a.agent_type}
                    </Text>
                  </View>
                  <Text style={{
                    fontFamily: ZP.font.monoMed, fontSize: 12, color: ZP.muted,
                  }}>
                    {fmtMoney(a.wallet_balance_cents / 100, a.currency)}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={lbl}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={ZP.dim}
            style={{
              fontFamily: ZP.font.monoMed, fontSize: 28, color: ZP.text,
              paddingVertical: 8,
            }}
          />

          <Text style={[lbl, { marginTop: 14 }]}>Memo (optional)</Text>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="e.g. Q2 ops budget"
            placeholderTextColor={ZP.dim}
            style={input}
          />

          <View style={{ marginTop: 16 }}>
            <GradientButton
              label={sending ? "Distributing…" : `Distribute ${amount ? fmtMoney(Number(amount) || 0, currency) : ""}`}
              loading={sending}
              onPress={distribute}
              fullWidth
              size="md"
            />
          </View>
        </BankingCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const lbl = {
  fontFamily: ZP.font.sansSemi, fontSize: 10, color: ZP.muted,
  letterSpacing: 1.1, textTransform: "uppercase" as const, marginBottom: 6,
};
const input = {
  padding: 12, borderRadius: 10,
  borderWidth: 1, borderColor: ZP.border,
  backgroundColor: ZP.bg2, color: ZP.text,
  fontFamily: ZP.font.sans, fontSize: 14,
};
