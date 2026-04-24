import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ZP, fmtTime, fmtDate } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { SkeletonRow } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { StatusPill } from "../../components/ui/StatusPill";
import { api } from "../../lib/api";

interface Event {
  id: string; actor_type: string; actor_id: string; actor_email: string | null;
  action: string; resource_type: string; resource_id: string | null;
  severity: "info" | "warning" | "critical";
  created_at: string;
}

export function AuditScreen() {
  const nav = useNavigation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api<{ events: Event[] }>("/api/v1/agents/audit-log?limit=100", { agentsScoped: true });
      setEvents(r.events ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Audit log" subtitle="Every action, append-only." onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 8 }}>
        {loading && events.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : events.length === 0 ? (
          <EmptyState title="No audit events" subtitle="Events appear as merchants + agents act on your resources." />
        ) : (
          events.map((e) => (
            <BankingCard key={e.id} padding={12}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 13, color: ZP.text }}>{e.action}</Text>
                    <StatusPill status={e.severity} />
                  </View>
                  <Text style={{ fontFamily: ZP.font.mono, fontSize: 11, color: ZP.muted, marginTop: 3 }} numberOfLines={1}>
                    {e.resource_type}{e.resource_id ? ` · ${e.resource_id.slice(0, 20)}…` : ""}
                  </Text>
                  <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.dim, marginTop: 2 }} numberOfLines={1}>
                    {e.actor_email ?? e.actor_id} · {fmtDate(e.created_at)} {fmtTime(e.created_at)}
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
