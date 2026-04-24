import React, { useEffect, useRef } from "react";
import { Animated, SafeAreaView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ZP } from "../../constants/brand";

export function SplashScreen() {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 120 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ transform: [{ scale }], opacity, alignItems: "center", gap: 16 }}>
        <LinearGradient
          colors={ZP.gradient as unknown as [string, string, string]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{
            width: 88, height: 88, borderRadius: 24,
            alignItems: "center", justifyContent: "center",
            shadowColor: ZP.cyan, shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 },
          }}
        >
          <Text style={{ color: "#fff", fontFamily: ZP.font.sansBold, fontSize: 44, letterSpacing: -2 }}>Z</Text>
        </LinearGradient>
        <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 22, color: ZP.text, letterSpacing: -0.5 }}>ZeniPay</Text>
        <View style={{ height: 2, width: 64, borderRadius: 2, backgroundColor: ZP.bg2 }} />
      </Animated.View>
    </SafeAreaView>
  );
}
