import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { AlertTriangle, Check, Clock, Shield, X } from "lucide-react-native";
import { ZP } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";
import { api } from "../../lib/api";

interface Check { id: string; check_type: string; status: "pass" | "fail" | "warning" | "pending"; details: string | null; last_checked_at: string }

export function ComplianceScreen() {
  const nav = useNavigation();
  const [checks, setChecks] = useState<Check[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api<{ checks: Check[]; score: number; total: number }>("/api/v1/agents/compliance", { agentsScoped: true });
      setChecks(r.checks ?? []);
      setScore(r.score ?? 0);
      setTotal(r.total ?? 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Compliance" onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 14 }}>
        {loading && checks.length === 0 ? (
          <SkeletonCard />
        ) : (
          <BankingCard padding={22}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Shield size={18} color={ZP.violet} />
              <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 11, color: ZP.violet, letterSpacing: 1.2, textTransform: "uppercase" }}>
                SOC2 Readiness
              </Text>
              <View style={{ flex: 1 }} />
              <View style={{
                backgroundColor: ZP.warningBg,
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
              }}>
                <Text style={{ color: ZP.warning, fontFamily: ZP.font.sansBold, fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase" }}>
                  Type II · In Progress
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: ZP.font.monoMed, fontSize: 44, color: ZP.text, letterSpacing: -1 }}>
              {score}<Text style={{ fontSize: 22, color: ZP.muted }}>/{total}</Text>
            </Text>
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 13, color: ZP.muted, marginTop: 4 }}>
              {pct}% of controls passing
            </Text>
            <View style={{ marginTop: 14, height: 8, borderRadius: 999, backgroundColor: ZP.bg2, overflow: "hidden" }}>
              <LinearGradient
                colors={ZP.gradient as unknown as [string, string, string]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ height: "100%", width: `${pct}%` }}
              />
            </View>
          </BankingCard>
        )}

        <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 15, color: ZP.text, marginTop: 6 }}>Controls</Text>
        {checks.map((c) => <CheckCard key={c.id} check={c} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

function CheckCard({ check }: { check: Check }) {
  const map = {
    pass:    { color: ZP.success, bg: ZP.successBg, icon: <Check size={18} color={ZP.success} /> },
    warning: { color: ZP.warning, bg: ZP.warningBg, icon: <AlertTriangle size={18} color={ZP.warning} /> },
    fail:    { color: ZP.danger,  bg: ZP.dangerBg,  icon: <X size={18} color={ZP.danger} /> },
    pending: { color: ZP.muted,   bg: ZP.bg2,       icon: <Clock size={18} color={ZP.muted} /> },
  }[check.status];

  return (
    <BankingCard padding={14}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{
          width: 34, height: 34, borderRadius: 10,
          backgroundColor: map.bg, alignItems: "center", justifyContent: "center",
        }}>{map.icon}</View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 13, color: ZP.text, textTransform: "capitalize" }}>
            {check.check_type.replace(/_/g, " ")}
          </Text>
          {check.details && (
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, marginTop: 2, lineHeight: 15 }}>
              {check.details}
            </Text>
          )}
        </View>
        <View style={{
          paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999,
          backgroundColor: map.bg,
        }}>
          <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 9, color: map.color, letterSpacing: 0.8, textTransform: "uppercase" }}>
            {check.status}
          </Text>
        </View>
      </View>
    </BankingCard>
  );
}
