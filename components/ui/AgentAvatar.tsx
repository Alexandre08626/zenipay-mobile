// Round agent avatar. Gradient background derived from the name hash
// (so "Marco" is always the same tone), with the first initial over
// it. A small status dot lives at the bottom-right.

import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ZP, hashHue } from "../../constants/brand";

export function AgentAvatar({
  name, size = 40, status = "active",
}: {
  name: string;
  size?: number;
  status?: "active" | "paused" | "offline";
}) {
  const hue = hashHue(name);
  const initial = (name.trim()[0] || "?").toUpperCase();
  const dotColor = status === "active" ? ZP.success : ZP.dim;

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <LinearGradient
        colors={[`hsl(${hue}, 72%, 55%)`, `hsl(${(hue + 40) % 360}, 72%, 44%)`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size, height: size, borderRadius: size / 2,
          alignItems: "center", justifyContent: "center",
          shadowColor: "#0f172a", shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.42 }}>{initial}</Text>
      </LinearGradient>
      <View style={{
        position: "absolute", right: 0, bottom: 0,
        width: Math.max(10, size * 0.28), height: Math.max(10, size * 0.28),
        borderRadius: size,
        backgroundColor: dotColor,
        borderWidth: 2, borderColor: "#fff",
      }} />
    </View>
  );
}
