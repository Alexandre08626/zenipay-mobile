import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Plus } from "lucide-react-native";
import { ZP, fmtMoney } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { GradientButton } from "../../components/ui/GradientButton";
import { ZeniCardVisual } from "../../components/ui/ZeniCardVisual";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { BankingCard } from "../../components/ui/BankingCard";
import { api } from "../../lib/api";
import type { RootStackParamList } from "../../navigation/RootNavigator";

interface Card {
  id: string; last4: string; expiry: string; status: string;
  card_type: string; is_physical: boolean;
  spending_limit: number;
  holder_name?: string;
}

export function CardsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ cards: Card[] }>("/api/zenipay/banking-ops", { merchantScoped: true });
      setCards(r.cards ?? []);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const active = cards.filter((c) => c.status === "active").length;
  const frozen = cards.filter((c) => c.status === "frozen").length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader
        title="Cards"
        right={<GradientButton size="sm" label="Issue" icon={<Plus size={12} color="#fff" />} />}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={ZP.cyan} />}
      >
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <Stat label="Active" value={String(active)} />
          <Stat label="Frozen" value={String(frozen)} />
          <Stat label="Total"  value={String(cards.length)} />
        </View>

        {loading && cards.length === 0 ? (
          <SkeletonCard />
        ) : cards.length === 0 ? (
          <EmptyState
            icon={<Plus size={24} color={ZP.muted} />}
            title="No cards yet"
            subtitle="Issue a virtual ZeniPay card or apply for a physical one."
          />
        ) : (
          <View style={{ gap: 16, alignItems: "center" }}>
            {cards.map((c) => (
              <Pressable key={c.id} onPress={() => nav.navigate("CardDetail", { id: c.id })}>
                <ZeniCardVisual
                  holderName={c.holder_name ?? "Merchant"}
                  last4={c.last4}
                  expiry={c.expiry}
                  frozen={c.status === "frozen"}
                  canceled={c.status === "canceled"}
                  width={320}
                />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{
      flex: 1, backgroundColor: "#fff", borderRadius: 12,
      borderWidth: 1, borderColor: ZP.border, padding: 12,
    }}>
      <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 10, color: ZP.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>{label}</Text>
      <Text style={{ fontFamily: ZP.font.monoMed, fontSize: 18, color: ZP.text, marginTop: 4 }}>{value}</Text>
    </View>
  );
}
