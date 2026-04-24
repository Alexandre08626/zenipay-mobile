import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { Activity } from "lucide-react-native";
import { ZP, fmtMoney } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { SkeletonRow } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { api } from "../../lib/api";

interface Entry {
  id: string;
  tx_group: string;
  direction: "debit" | "credit";
  amount_micro: string | number;
  currency: string;
  memo: string;
  posted_at: string;
  posted_by: string;
}
interface Integrity { total_entries: number; verified_entries: number; is_intact: boolean }

export function LedgerScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [integrity, setIntegrity] = useState<Integrity | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ entries: Entry[]; integrity: Integrity }>("/api/v1/agents/ledger", { agentsScoped: true });
      setEntries(r.entries ?? []);
      setIntegrity(r.integrity ?? null);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  // Auto-refresh every 10s while screen is open.
  useEffect(() => {
    const i = setInterval(() => { void load(); }, 10_000);
    return () => clearInterval(i);
  }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="ZeniCore Ledger" subtitle="Tamper-evident, double-entry." />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={ZP.violet} />}
      >
        <BankingCard accent="violet">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Activity size={20} color={integrity?.is_intact ? ZP.success : ZP.danger} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 14, color: ZP.text }}>
                {integrity?.is_intact ? "Chain verified" : "Chain broken"}
              </Text>
              <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, marginTop: 2 }}>
                {integrity ? `${integrity.verified_entries}/${integrity.total_entries} entries verified` : "—"}
              </Text>
            </View>
            <View style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: integrity?.is_intact ? ZP.success : ZP.danger,
            }} />
          </View>
        </BankingCard>

        <BankingCard padding={0}>
          {loading && entries.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : entries.length === 0 ? (
            <View style={{ padding: 12 }}>
              <EmptyState title="Ledger is empty" subtitle="Fund the treasury to post the first entry." />
            </View>
          ) : (
            entries.map((e, i) => (
              <View key={e.id} style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                paddingHorizontal: 14, paddingVertical: 12,
                borderTopWidth: i === 0 ? 0 : 1, borderTopColor: ZP.border,
              }}>
                <Text style={{
                  fontFamily: ZP.font.mono, fontSize: 10, color: ZP.dim,
                  width: 68,
                }} numberOfLines={1}>
                  {e.tx_group.slice(0, 10)}…
                </Text>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 12, color: ZP.text }} numberOfLines={1}>
                    {e.memo || "ZeniCore entry"}
                  </Text>
                  <Text style={{ fontFamily: ZP.font.mono, fontSize: 10, color: ZP.muted, marginTop: 2 }} numberOfLines={1}>
                    {e.posted_by} · {new Date(e.posted_at).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={{
                  fontFamily: ZP.font.monoMed, fontSize: 13,
                  color: e.direction === "credit" ? ZP.success : ZP.text,
                  fontVariant: ["tabular-nums"] as const,
                }}>
                  {e.direction === "credit" ? "+" : "−"}
                  {fmtMoney(Number(BigInt(e.amount_micro) / BigInt(10_000)) / 100, e.currency)}
                </Text>
              </View>
            ))
          )}
        </BankingCard>
      </ScrollView>
    </SafeAreaView>
  );
}
