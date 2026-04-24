import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { Check, CheckSquare, X } from "lucide-react-native";
import { ZP, fmtMoney } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { GradientButton } from "../../components/ui/GradientButton";
import { StatusPill } from "../../components/ui/StatusPill";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonRow } from "../../components/ui/LoadingSkeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";

interface Row {
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
  const nav = useNavigation();
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ approvals: Row[] }>("/api/v1/agents/approvals?limit=100", { agentsScoped: true });
      setRows(r.approvals ?? []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const act = async (r: Row, decision: "approve" | "reject") => {
    setBusyId(r.id);
    try {
      await Haptics.impactAsync(decision === "approve" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
      await api(`/api/v1/agents/approvals/${r.id}/${decision}`, {
        method: "POST",
        agentsScoped: true,
        body: decision === "reject" ? { reason: null } : {},
      });
      toast.show(decision === "approve" ? `Approved ${fmtMoney(Number(r.amount_units ?? 0), r.currency ?? "CAD")}` : "Rejected", decision === "approve" ? "success" : "info");
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Failed.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const pending = rows.filter((r) => r.status === "pending");
  const history = rows.filter((r) => r.status !== "pending");
  const list = tab === "pending" ? pending : history;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Approvals" onBack={() => nav.goBack()} />

      <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 16, marginBottom: 10 }}>
        {(["pending", "history"] as const).map((t) => (
          <View
            key={t}
            onTouchEnd={() => setTab(t)}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
              backgroundColor: tab === t ? ZP.text : ZP.bg2,
              borderWidth: 1, borderColor: tab === t ? ZP.text : ZP.border,
            }}
          >
            <Text style={{
              fontFamily: ZP.font.sansSemi, fontSize: 11,
              color: tab === t ? "#fff" : ZP.muted,
              textTransform: "capitalize", letterSpacing: 0.5,
            }}>
              {t === "pending" ? `Pending (${pending.length})` : "History"}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={ZP.violet} />}
      >
        {loading && rows.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : list.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={28} color={ZP.violet} />}
            title={tab === "pending" ? "Nothing pending ✓" : "No resolved approvals yet"}
            subtitle={tab === "pending" ? "Your agents are all clear." : ""}
          />
        ) : (
          list.map((r) => (
            <BankingCard key={r.id} padding={14}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 14, color: ZP.text }}>
                    {r.agent_name ?? "Approval"}
                  </Text>
                  <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, marginTop: 2 }}>
                    {r.source === "merchant_rule" ? "Merchant rule" : "TOTP signature"}
                    {r.expires_at && tab === "pending" ? ` · expires ${new Date(r.expires_at).toLocaleDateString("en-CA")}` : ""}
                  </Text>
                </View>
                <Text style={{ fontFamily: ZP.font.monoMed, fontSize: 15, color: ZP.text }}>
                  {fmtMoney(Number(r.amount_units ?? 0), r.currency ?? "CAD")}
                </Text>
              </View>
              {tab === "pending" && r.source === "merchant_rule" && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                  <GradientButton size="sm" label="Approve" icon={<Check size={12} color="#fff" />} loading={busyId === r.id} onPress={() => act(r, "approve")} />
                  <GradientButton size="sm" variant="secondary" label="Reject" icon={<X size={12} color={ZP.danger} />} loading={busyId === r.id} onPress={() => act(r, "reject")} />
                </View>
              )}
              {tab === "history" && (
                <View style={{ marginTop: 8 }}>
                  <StatusPill status={r.status} />
                </View>
              )}
            </BankingCard>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
