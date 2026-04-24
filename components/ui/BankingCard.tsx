import React from "react";
import { View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ZP } from "../../constants/brand";

type Accent = "cyan" | "violet" | "green" | "pink" | "orange" | "gradient" | "none";

const ACCENT_MAP: Record<Exclude<Accent, "gradient" | "none">, string> = {
  cyan: ZP.cyan,
  violet: ZP.violet,
  green: ZP.green,
  pink: ZP.pink,
  orange: ZP.orange,
};

export function BankingCard({
  children, accent = "none", style, padding = 16,
}: {
  children: React.ReactNode;
  accent?: Accent;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
}) {
  return (
    <View style={[{
      backgroundColor: "#fff",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ZP.border,
      overflow: "hidden",
      shadowColor: "#0f172a",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    }, style as ViewStyle]}>
      {accent === "gradient" ? (
        <LinearGradient
          colors={ZP.gradient as unknown as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 3, width: "100%" }}
        />
      ) : accent !== "none" ? (
        <View style={{ height: 3, backgroundColor: ACCENT_MAP[accent] }} />
      ) : null}
      <View style={{ padding }}>
        {children}
      </View>
    </View>
  );
}
