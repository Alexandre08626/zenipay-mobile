import React, { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";
import { ZP } from "../../constants/brand";

export function Skeleton({
  width, height = 14, radius = 6, style,
}: {
  width?: number | `${number}%` | "100%" | "auto";
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  return (
    <Animated.View
      style={[{
        width: (width as ViewStyle["width"]) ?? "100%",
        height,
        borderRadius: radius,
        backgroundColor: ZP.bg3,
        opacity,
      }, style]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: ZP.border,
      padding: 16, gap: 10,
    }}>
      <Skeleton width="40%" height={10} />
      <Skeleton width="75%" height={28} />
      <Skeleton width="55%" height={12} />
    </View>
  );
}

export function SkeletonRow() {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      paddingVertical: 12, paddingHorizontal: 16, gap: 12,
    }}>
      <Skeleton width={36} height={36} radius={18} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="60%" height={12} />
        <Skeleton width="40%" height={10} />
      </View>
      <Skeleton width={80} height={14} />
    </View>
  );
}
