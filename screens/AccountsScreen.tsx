// Accounts — list of zenipay_accounts with balances.

import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from "react-native";
import { ZP, fmtMoney } from "../constants/brand";
import { BankingCard } from "../components/ui/BankingCard";
import { api } from "../lib/api";

interface Account {
  id: string; account_name: string; account_number: string;
  balance: number; currency: string; is_primary: boolean;
  account_type: string; status: string;
}

export function AccountsScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ accounts: Account[] }>("/api/zenipay/banking-ops", { merchantScoped: true });
      setAccounts((r.accounts ?? []).filter((a) => a.status !== "closed"));
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <Text style={{ fontSize: 24, fontWeight: "800", color: ZP.text, letterSpacing: -0.5, marginBottom: 14 }}>
          Accounts
        </Text>

        {loading && accounts.length === 0 ? (
          <BankingCard><Text style={{ color: ZP.muted }}>Loading…</Text></BankingCard>
        ) : accounts.length === 0 ? (
          <BankingCard>
            <Text style={{ color: ZP.muted, fontSize: 13 }}>
              No accounts yet. Create one from the web dashboard.
            </Text>
          </BankingCard>
        ) : (
          <View style={{ gap: 10 }}>
            {accounts.map((a) => {
              const isSavings = a.account_type?.includes("savings");
              const masked = `•••• ${(a.account_number ?? "").slice(-4)}`;
              return (
                <BankingCard key={a.id} accent={isSavings ? "violet" : "cyan"}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
                        {a.is_primary && <Pill label="Primary" tone="brand" />}
                        <Pill label={isSavings ? "Savings" : "Checking"} tone="neutral" />
                      </View>
                      <Text style={{ fontSize: 15, fontWeight: "800", color: ZP.text }}>{a.account_name}</Text>
                      <Text style={{ fontSize: 11, color: ZP.dim, marginTop: 3, fontFamily: "Menlo" }}>{masked}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 10, fontWeight: "800", color: ZP.muted, letterSpacing: 1, textTransform: "uppercase" }}>
                        Available
                      </Text>
                      <Text style={{
                        fontSize: 22, fontWeight: "800", color: ZP.text, marginTop: 3,
                        fontVariant: ["tabular-nums"], fontFamily: "Menlo",
                      }}>
                        {fmtMoney(Number(a.balance || 0), a.currency || "CAD")}
                      </Text>
                    </View>
                  </View>
                </BankingCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Pill({ label, tone }: { label: string; tone: "brand" | "neutral" }) {
  return (
    <View style={{
      paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
      backgroundColor: tone === "brand" ? "rgba(15,184,201,0.1)" : ZP.bg2,
    }}>
      <Text style={{
        fontSize: 9, fontWeight: "800", color: tone === "brand" ? ZP.cyan : ZP.muted,
        letterSpacing: 1, textTransform: "uppercase",
      }}>{label}</Text>
    </View>
  );
}
