import React from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ZP } from "../../constants/brand";
import { useAppMode } from "../../lib/app-mode";

export function ModeSwitcher() {
  const { mode, setMode } = useAppMode();

  const pick = async (m: "merchant" | "agents") => {
    if (m === mode) return;
    try { await Haptics.selectionAsync(); } catch { /* ignore */ }
    await setMode(m);
  };

  return (
    <View style={{
      flexDirection: "row",
      backgroundColor: ZP.bg2,
      borderRadius: 999,
      padding: 3,
      borderWidth: 1, borderColor: ZP.border,
    }}>
      <Pill active={mode === "merchant"} onPress={() => pick("merchant")} label="Merchant" accent={ZP.cyan} />
      <Pill active={mode === "agents"}   onPress={() => pick("agents")}   label="Agents"   accent={ZP.violet} />
    </View>
  );
}

function Pill({
  active, onPress, label, accent,
}: { active: boolean; onPress: () => void; label: string; accent: string }) {
  return (
    <Pressable onPress={onPress} style={{ overflow: "hidden", borderRadius: 999 }}>
      {active ? (
        <LinearGradient
          colors={[accent, accent]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Text style={{ color: "#fff", fontFamily: ZP.font.sansSemi, fontSize: 11, letterSpacing: 0.4 }}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: ZP.muted, fontFamily: ZP.font.sansSemi, fontSize: 11, letterSpacing: 0.4 }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
