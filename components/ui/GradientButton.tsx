// Gradient CTA — uses the signature 3-stop ZeniPay gradient and
// fires a haptic impact on press so the button feels native.

import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ZP } from "../../constants/brand";

export interface GradientButtonProps {
  label: string;
  onPress?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function GradientButton({
  label, onPress, loading = false, disabled = false,
  variant = "primary", size = "md", icon, fullWidth,
}: GradientButtonProps) {
  const isDisabled = disabled || loading;
  const padH = size === "lg" ? 24 : size === "sm" ? 14 : 18;
  const padV = size === "lg" ? 14 : size === "sm" ? 9 : 12;
  const fontSize = size === "lg" ? 16 : size === "sm" ? 12 : 14;

  const press = async () => {
    if (isDisabled) return;
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { /* ignore */ }
    await onPress?.();
  };

  const inner = (
    <View style={{
      paddingHorizontal: padH, paddingVertical: padV,
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : ZP.violet} size="small" />
      ) : (
        <>
          {icon}
          <Text style={{
            color: variant === "primary" ? "#fff" : ZP.text,
            fontSize, fontWeight: "700", letterSpacing: 0.2,
          }}>{label}</Text>
        </>
      )}
    </View>
  );

  if (variant === "ghost") {
    return (
      <Pressable
        onPress={press}
        disabled={isDisabled}
        style={({ pressed }) => ([styles.ghost, {
          alignSelf: fullWidth ? "stretch" : "flex-start",
          opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1,
        }])}
      >
        {inner}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={press}
      disabled={isDisabled}
      style={({ pressed }) => ({
        borderRadius: 14,
        alignSelf: fullWidth ? "stretch" : "flex-start",
        opacity: isDisabled ? 0.55 : pressed ? 0.92 : 1,
        shadowColor: ZP.cyan, shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      })}
    >
      <LinearGradient
        colors={ZP.gradient as unknown as [string, string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 14 }}
      >
        {inner}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ghost: {
    borderRadius: 14,
    backgroundColor: ZP.bg2,
    borderWidth: 1,
    borderColor: ZP.border,
  },
});
