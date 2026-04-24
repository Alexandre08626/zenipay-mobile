import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ZP, fmtMoney, maskAccount } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { BalanceAmount } from "../../components/ui/BalanceAmount";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";
import { api } from "../../lib/api";

interface Account {
  id: string; account_name: string; account_type: string; balance: number;
  currency: string; account_number: string; routing_number: string; is_primary: boolean;
  status: string; created_at?: string;
}

export function AccountDetailScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const id = (route.params as { id: string }).id;
  const [acc, setAcc] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await api<{ accounts: Account[] }>("/api/zenipay/banking-ops", { merchantScoped: true });
      setAcc((r.accounts ?? []).find((a) => a.id === id) ?? null);
    } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title={acc?.account_name ?? "Account"} onBack={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        {loading ? (
          <SkeletonCard />
        ) : acc ? (
          <>
            <BankingCard accent={acc.account_type?.includes("savings") ? "violet" : "cyan"}>
              <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 10, color: ZP.muted, letterSpacing: 1.1, textTransform: "uppercase" }}>
                Available balance
              </Text>
              <BalanceAmount amount={Number(acc.balance || 0)} currency={acc.currency || "CAD"} size="hero" style={{ marginTop: 6 }} />
            </BankingCard>

            <BankingCard>
              <InfoRow k="Account name" v={acc.account_name} />
              <InfoRow k="Type" v={acc.account_type?.replace(/_/g, " ")} />
              <InfoRow k="Account #" v={maskAccount(acc.account_number)} mono />
              <InfoRow k="Routing #" v={maskAccount(acc.routing_number, 3)} mono />
              <InfoRow k="Currency" v={acc.currency} />
              <InfoRow k="Status" v={acc.status} />
              {acc.created_at && <InfoRow k="Opened" v={new Date(acc.created_at).toLocaleDateString("en-CA")} />}
            </BankingCard>
          </>
        ) : (
          <Text style={{ fontFamily: ZP.font.sans, color: ZP.muted, textAlign: "center", padding: 24 }}>
            Account not found.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ k, v, mono }: { k: string; v?: string | null; mono?: boolean }) {
  return (
    <View style={{
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingVertical: 10, borderTopWidth: 1, borderTopColor: ZP.border,
    }}>
      <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 11, color: ZP.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>{k}</Text>
      <Text style={{ fontFamily: mono ? ZP.font.mono : ZP.font.sans, fontSize: 13, color: ZP.text, flexShrink: 1, textAlign: "right" }} numberOfLines={1}>
        {v ?? "—"}
      </Text>
    </View>
  );
}

// touch unused
void fmtMoney;
