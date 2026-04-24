import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { ZP, fmtMoney, fmtDate } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { DataRow } from "../../components/ui/DataRow";
import { SkeletonRow } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { api } from "../../lib/api";
import type { RootStackParamList } from "../../navigation/RootNavigator";

interface ActivityRow {
  id: string; date: string; amount: number; currency: string;
  description: string; counterparty: string; direction: "in" | "out"; status: string;
}

export function TransactionsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");

  const load = useCallback(async () => {
    try {
      const r = await api<{ activity: ActivityRow[] }>("/api/zenipay/merchant-activity?limit=200", { merchantScoped: true });
      setRows(r.activity ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = rows.filter((r) => filter === "all" ? true : r.direction === filter);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Transactions" onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", gap: 6 }}>
        {(["all", "in", "out"] as const).map((f) => (
          <View
            key={f}
            onTouchEnd={() => setFilter(f)}
            style={{
              paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999,
              backgroundColor: filter === f ? ZP.text : ZP.bg2,
              borderWidth: 1, borderColor: filter === f ? ZP.text : ZP.border,
            }}
          >
            <Text style={{
              fontFamily: ZP.font.sansSemi, fontSize: 11,
              color: filter === f ? "#fff" : ZP.muted,
              letterSpacing: 0.5, textTransform: "capitalize",
            }}>{f === "all" ? "All" : f === "in" ? "Income" : "Spending"}</Text>
          </View>
        ))}
      </View>

      {loading && rows.length === 0 ? (
        <View style={{ flex: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ padding: 20 }}>
          <EmptyState title="No transactions" subtitle="Nothing matches this filter." />
        </View>
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => (
            <View style={{ borderBottomWidth: 1, borderBottomColor: ZP.border, backgroundColor: "#fff" }}>
              <DataRow
                icon={item.direction === "in"
                  ? <ArrowDownLeft size={16} color={ZP.success} />
                  : <ArrowUpRight size={16} color={ZP.muted} />}
                title={item.description}
                subtitle={item.counterparty}
                right={
                  <Text style={{
                    fontFamily: ZP.font.monoMed, fontSize: 14,
                    color: item.direction === "in" ? ZP.success : ZP.text,
                    fontVariant: ["tabular-nums"] as const,
                  }}>
                    {item.direction === "in" ? "+" : "−"}{fmtMoney(Math.abs(item.amount), item.currency)}
                  </Text>
                }
                rightSub={fmtDate(item.date)}
                onPress={() => nav.navigate("TransactionDetail", { id: item.id })}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
