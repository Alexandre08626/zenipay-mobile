import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ZP } from "../../constants/brand";

// Credit-card-style visual for ZeniCards + merchant cards. Always
// renders the gradient-ZP face; pass `frozen` or `canceled` to overlay.

export function ZeniCardVisual({
  holderName, last4, expiry, frozen, canceled, width = 320,
}: {
  holderName: string;
  last4: string;
  expiry: string;
  frozen?: boolean;
  canceled?: boolean;
  width?: number;
}) {
  const height = Math.round(width * 0.6);
  const disabled = frozen || canceled;
  return (
    <View style={{
      width, height, borderRadius: 18,
      overflow: "hidden",
      shadowColor: "#0f172a",
      shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    }}>
      <LinearGradient
        colors={ZP.gradient as unknown as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, padding: 20, justifyContent: "space-between" }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Text style={{ color: "#fff", fontFamily: ZP.font.sansBold, fontSize: 18, letterSpacing: 1 }}>ZeniPay</Text>
          <View style={{ width: 36, height: 26, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.2)" }} />
        </View>

        <View style={{ gap: 6 }}>
          <Text style={{
            color: "#fff", fontFamily: ZP.font.monoMed, fontSize: 18,
            letterSpacing: 2.5, fontVariant: ["tabular-nums"] as const,
          }}>
            ••••  ••••  ••••  {last4}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontFamily: ZP.font.sans, fontSize: 9, letterSpacing: 1 }}>CARD HOLDER</Text>
              <Text style={{ color: "#fff", fontFamily: ZP.font.sansSemi, fontSize: 13, marginTop: 3, letterSpacing: 0.3 }} numberOfLines={1}>
                {holderName.toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontFamily: ZP.font.sans, fontSize: 9, letterSpacing: 1 }}>EXPIRES</Text>
              <Text style={{ color: "#fff", fontFamily: ZP.font.monoMed, fontSize: 13, marginTop: 3, letterSpacing: 1 }}>
                {expiry}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {disabled && (
        <View style={{
          position: "absolute", inset: 0 as unknown as number,
          top: 0, bottom: 0, left: 0, right: 0,
          backgroundColor: "rgba(15,23,42,0.55)",
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{
            color: "#fff", fontFamily: ZP.font.sansBold, fontSize: 12,
            letterSpacing: 2, textTransform: "uppercase",
          }}>{canceled ? "Canceled" : "Frozen"}</Text>
        </View>
      )}
    </View>
  );
}
