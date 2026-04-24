import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { SendHorizontal } from "lucide-react-native";
import { ZP, fmtMoney } from "../../constants/brand";
import { BankingCard } from "../../components/ui/BankingCard";
import { GradientButton } from "../../components/ui/GradientButton";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { SkeletonCard } from "../../components/ui/LoadingSkeleton";
import { useToast } from "../../components/ui/Toast";
import { api } from "../../lib/api";
import { getMerchantId } from "../../lib/session";

interface Account { id: string; account_name: string; balance: number; currency: string; is_primary: boolean; status: string }

export function TransferScreen() {
  const toast = useToast();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromId, setFromId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api<{ accounts: Account[] }>("/api/zenipay/banking-ops", { merchantScoped: true });
      const active = (r.accounts ?? []).filter((a) => a.status !== "closed");
      setAccounts(active);
      const primary = active.find((a) => a.is_primary) ?? active[0];
      if (primary) setFromId(primary.id);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const fromAccount = useMemo(() => accounts.find((a) => a.id === fromId), [accounts, fromId]);

  const submit = async () => {
    const amt = Number(amount);
    if (!fromAccount) { toast.show("Pick a source account.", "error"); return; }
    if (!Number.isFinite(amt) || amt <= 0) { toast.show("Enter an amount > 0.", "error"); return; }
    if (amt > Number(fromAccount.balance || 0)) { toast.show("Insufficient balance.", "error"); return; }
    setSending(true);
    try {
      const merchantId = await getMerchantId();
      if (!merchantId) { toast.show("Session expired.", "error"); return; }
      await api("/api/v1/agents/treasury/distribute-from-merchant", {
        method: "POST",
        body: {
          merchant_id: merchantId,
          from_account_id: fromAccount.id,
          amount_units: amt,
          currency: fromAccount.currency,
          idempotency_key: `mobile-merch2treas-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          memo,
        },
      });
      toast.show(`${fmtMoney(amt, fromAccount.currency)} sent to your agent treasury.`, "success");
      setAmount(""); setMemo("");
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Transfer failed.", "error");
    } finally { setSending(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Send" subtitle="Fund your AI agent treasury." />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
          {loading ? (
            <SkeletonCard />
          ) : (
            <BankingCard accent="cyan">
              <Text style={lbl}>From account</Text>
              <View style={{ gap: 6 }}>
                {accounts.map((a) => (
                  <PickRow
                    key={a.id}
                    active={a.id === fromId}
                    onPress={() => setFromId(a.id)}
                    title={a.account_name + (a.is_primary ? " · Primary" : "")}
                    subtitle={`${fmtMoney(Number(a.balance || 0), a.currency)} available`}
                  />
                ))}
              </View>
            </BankingCard>
          )}

          <BankingCard accent="violet">
            <Text style={lbl}>Destination</Text>
            <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 14, color: ZP.text, marginTop: 4 }}>
              Agent treasury · {fromAccount?.currency ?? "CAD"}
            </Text>
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, marginTop: 3 }}>
              Funds land in your org treasury first. Distribute to individual agents from the Agents tab.
            </Text>
          </BankingCard>

          <BankingCard>
            <Text style={lbl}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={ZP.dim}
              style={{
                fontFamily: ZP.font.monoMed, fontSize: 32, color: ZP.text,
                paddingVertical: 10,
              }}
            />
            <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted }}>
              {fromAccount ? `Max ${fmtMoney(Number(fromAccount.balance || 0), fromAccount.currency)}` : ""}
            </Text>

            <Text style={[lbl, { marginTop: 14 }]}>Memo (optional)</Text>
            <TextInput
              value={memo}
              onChangeText={setMemo}
              placeholder="e.g. Weekly agent payroll"
              placeholderTextColor={ZP.dim}
              style={input}
            />
          </BankingCard>

          <GradientButton
            label={sending ? "Sending…" : "Send"}
            icon={<SendHorizontal size={14} color="#fff" />}
            onPress={submit}
            loading={sending}
            fullWidth
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PickRow({ active, onPress, title, subtitle }: { active: boolean; onPress: () => void; title: string; subtitle: string }) {
  return (
    <View
      onTouchEnd={onPress}
      style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        padding: 12, borderRadius: 10,
        borderWidth: 1.5, borderColor: active ? ZP.cyan : ZP.border,
        backgroundColor: active ? ZP.infoBg : "#fff",
      }}
    >
      <View style={{
        width: 18, height: 18, borderRadius: 9,
        borderWidth: 2, borderColor: active ? ZP.cyan : ZP.border,
        alignItems: "center", justifyContent: "center",
      }}>
        {active && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ZP.cyan }} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 13, color: ZP.text }}>{title}</Text>
        <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted, marginTop: 2 }}>{subtitle}</Text>
      </View>
    </View>
  );
}

const lbl = {
  fontFamily: ZP.font.sansSemi, fontSize: 10, color: ZP.muted,
  letterSpacing: 1.1, textTransform: "uppercase" as const, marginBottom: 8,
};
const input = {
  padding: 12, borderRadius: 10,
  borderWidth: 1, borderColor: ZP.border,
  backgroundColor: ZP.bg2, color: ZP.text,
  fontFamily: ZP.font.sans, fontSize: 14,
};
