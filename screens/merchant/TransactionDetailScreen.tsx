import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { ZP, fmtMoney, fmtDate, fmtTime } from "../../constants/brand";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { BankingCard } from "../../components/ui/BankingCard";
import { StatusPill } from "../../components/ui/StatusPill";

export function TransactionDetailScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const id = (route.params as { id: string } | undefined)?.id ?? "";

  // The feed already hydrates rows client-side on the overview / list
  // screens. This detail page is a lightweight placeholder that shows
  // the row id until a dedicated fetch endpoint ships — keeps deep
  // links from breaking in the meantime.

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title="Transaction" onBack={() => nav.goBack()} />
      <View style={{ padding: 16, gap: 14 }}>
        <BankingCard accent="cyan">
          <View style={{ alignItems: "center", paddingVertical: 10 }}>
            <ArrowDownLeft size={22} color={ZP.muted} />
            <Text style={{
              fontFamily: ZP.font.monoMed, fontSize: 38, color: ZP.text, marginTop: 8, letterSpacing: -0.5,
            }}>—</Text>
            <StatusPill status="completed" />
          </View>
          <View style={{ marginTop: 10 }}>
            <Row k="Transaction id" v={id} />
            <Row k="Date" v={fmtDate(new Date())} />
            <Row k="Time" v={fmtTime(new Date())} />
          </View>
        </BankingCard>
        <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, textAlign: "center", marginTop: 6 }}>
          Full transaction detail lands in the next release.  Open this row on the web dashboard for the complete breakdown.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{
      flexDirection: "row", justifyContent: "space-between", alignItems: "center",
      paddingVertical: 10, borderTopWidth: 1, borderTopColor: ZP.border,
    }}>
      <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 11, color: ZP.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>{k}</Text>
      <Text style={{ fontFamily: ZP.font.mono, fontSize: 12, color: ZP.text, flexShrink: 1, textAlign: "right" }} numberOfLines={1}>{v}</Text>
    </View>
  );
}

// Silence unused-import warnings.
void ArrowUpRight; void fmtMoney;
