import React from "react";
import { Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ZP, hashHue } from "../../constants/brand";

export function AgentAvatar({
  name, size = 40, status = "active", imageUri,
}: {
  name: string;
  size?: number;
  status?: "active" | "idle" | "offline";
  imageUri?: string | null;
}) {
  const hue = hashHue(name);
  const initial = (name.trim()[0] || "?").toUpperCase();
  const dotColor = status === "active" ? ZP.success : status === "idle" ? ZP.warning : ZP.dim;

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <LinearGradient
          colors={[`hsl(${hue}, 72%, 55%)`, `hsl(${(hue + 40) % 360}, 72%, 44%)`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: size, height: size, borderRadius: size / 2,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontFamily: ZP.font.sansBold, fontSize: size * 0.42 }}>{initial}</Text>
        </LinearGradient>
      )}
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
