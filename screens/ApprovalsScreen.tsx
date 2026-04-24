// Approvals — pending tab + history. Approve / reject inline.

import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Check, X } from "lucide-react-native";
import { ZP, fmtMoney } from "../constants/brand";
import { BankingCard } from "../components/ui/BankingCard";
import { GradientButton } from "../components/ui/GradientButton";
import { api } from "../lib/api";

interface ApprovalRow {
  id: string;
  source: "merchant_rule" | "agent_totp";
  status: string;
  amount_units?: number | null;
  currency?: string | null;
  agent_name?: string | null;
  approver_email?: string | null;
  created_at: string;
  expires_at: string | null;
}

export function ApprovalsScreen() {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ approvals: ApprovalRow[] }>("/api/v1/agents/approvals?limit=100", { agentsScoped: true });
      setRows(r.approvals ?? []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const pending = rows.filter((r) => r.status === "pending");
  const history = rows.filter((r) => r.status !== "pending");
  const visible = tab === "pending" ? pending : history;

  const act = async (row: ApprovalRow, decision: "approve" | "reject") => {
    setBusyId(row.id);
    try {
      await Haptics.impactAsync(
        decision === "approve" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy,
      );
      await api(`/api/v1/agents/approvals/${row.id}/${decision}`, {
        method: "POST",
        body: decision === "reject" ? { reason: null } : {},
        agentsScoped: true,
      });
      await load();
    } catch { /* toast handled by table reload */ }
    finally { setBusyId(null); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <Text style={{ fontSize: 24, fontWeight: "800", color: ZP.text, letterSpacing: -0.5, marginBottom: 14 }}>
          Approvals
        </Text>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          <TabBtn active={tab === "pending"} label={`Pending (${pending.length})`} onPress={() => setTab("pending")} />
          <TabBtn active={tab === "history"} label="History" onPress={() => setTab("history")} />
        </View>

        {loading && rows.length === 0 ? (
          <BankingCard><Text style={{ color: ZP.muted }}>Loading…</Text></BankingCard>
        ) : visible.length === 0 ? (
          <BankingCard>
            <Text style={{ color: ZP.muted, fontSize: 13 }}>
              {tab === "pending" ? "Nothing pending. Your agents are all clear ✓" : "No resolved approvals yet."}
            </Text>
          </BankingCard>
        ) : (
          <View style={{ gap: 10 }}>
            {visible.map((r) => (
              <BankingCard key={r.id} padding={14}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: ZP.text }}>
                      {r.agent_name ?? "Approval request"}
                    </Text>
                    <Text style={{ fontSize: 11, color: ZP.muted, marginTop: 2 }}>
                      {r.source === "merchant_rule" ? "Merchant rule" : "TOTP signature"}
                      {r.expires_at && tab === "pending" ? ` · expires ${new Date(r.expires_at).toLocaleDateString("en-CA")}` : ""}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: ZP.text, fontFamily: "Menlo" }}>
                    {fmtMoney(Number(r.amount_units ?? 0), r.currency ?? "CAD")}
                  </Text>
                </View>
                {tab === "pending" && r.source === "merchant_rule" && (
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <GradientButton
                      label="Approve"
                      size="sm"
                      icon={<Check size={13} color="#fff" />}
                      loading={busyId === r.id}
                      onPress={() => act(r, "approve")}
                    />
                    <GradientButton
                      label="Reject"
                      size="sm"
                      variant="ghost"
                      icon={<X size={13} color={ZP.danger} />}
                      loading={busyId === r.id}
                      onPress={() => act(r, "reject")}
                    />
                  </View>
                )}
                {tab === "history" && (
                  <Text style={{ marginTop: 8, fontSize: 11, color: ZP.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                    {r.status}
                  </Text>
                )}
              </BankingCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TabBtn({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <GradientButton
      label={label}
      size="sm"
      variant={active ? "primary" : "ghost"}
      onPress={onPress}
    />
  );
}
