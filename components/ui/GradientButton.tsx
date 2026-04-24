import React, { useRef } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ZP } from "../../constants/brand";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, { padH: number; padV: number; font: number; gap: number }> = {
  sm: { padH: 14, padV: 9,  font: 12, gap: 6 },
  md: { padH: 20, padV: 13, font: 14, gap: 8 },
  lg: { padH: 24, padV: 16, font: 16, gap: 10 },
};

export function GradientButton({
  label, onPress, loading, disabled, icon, variant = "primary", size = "md", fullWidth, style,
}: {
  label: string;
  onPress?: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  style?: ViewStyle;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const S = SIZE[size];
  const isDisabled = disabled || loading;

  const press = async () => {
    if (isDisabled) return;
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { /* ignore */ }
    await onPress?.();
  };

  const pressIn = () => {
    Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }).start();
  };

  const inner = (
    <View style={{
      paddingHorizontal: S.padH, paddingVertical: S.padV,
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: S.gap,
    }}>
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : ZP.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={{
            color: labelColor(variant),
            fontFamily: ZP.font.sansSemi,
            fontSize: S.font,
            letterSpacing: 0.1,
          }}>{label}</Text>
        </>
      )}
    </View>
  );

  const container: ViewStyle = {
    borderRadius: 14,
    alignSelf: fullWidth ? "stretch" : "flex-start",
    opacity: isDisabled ? 0.55 : 1,
    ...style,
  };

  if (variant === "primary") {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={press}
          onPressIn={pressIn}
          onPressOut={pressOut}
          disabled={isDisabled}
          style={[container, styles.primary]}
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
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={press}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        style={[
          container,
          variant === "ghost" ? styles.ghost : undefined,
          variant === "secondary" ? styles.secondary : undefined,
          variant === "danger" ? styles.danger : undefined,
        ]}
      >
        {inner}
      </Pressable>
    </Animated.View>
  );
}

function labelColor(v: Variant): string {
  if (v === "primary" || v === "danger") return "#fff";
  if (v === "ghost") return ZP.muted;
  return ZP.text;
}

const styles = StyleSheet.create({
  primary: {
    shadowColor: ZP.cyan, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  secondary: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: ZP.border,
  },
  danger: {
    backgroundColor: ZP.danger,
  },
});
