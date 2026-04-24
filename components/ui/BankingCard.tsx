// White card with a subtle shadow and a 3px accent top-border that
// picks up the per-section brand colour (cyan / violet / green / pink /
// neutral). Used everywhere throughout the app.

import React from "react";
import { View, ViewStyle } from "react-native";
import { ZP } from "../../constants/brand";

type Accent = "cyan" | "violet" | "green" | "pink" | "neutral";

const ACCENT: Record<Accent, string | undefined> = {
  cyan:   ZP.cyan,
  violet: ZP.violet,
  green:  ZP.green,
  pink:   ZP.pink,
  neutral: undefined,
};

export function BankingCard({
  children, accent = "neutral", style, padding = 16,
}: {
  children: React.ReactNode;
  accent?: Accent;
  style?: ViewStyle | ViewStyle[];
  padding?: number;
}) {
  const color = ACCENT[accent];
  return (
    <View style={[{
      backgroundColor: "#fff",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ZP.border,
      shadowColor: "#0f172a",
      shadowOpacity: 0.06,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 4 },
      overflow: "hidden",
    }, style as ViewStyle]}>
      {color && (
        <View style={{ height: 3, backgroundColor: color }} />
      )}
      <View style={{ padding }}>
        {children}
      </View>
    </View>
  );
}
