import React from "react";
import { Pressable, Text, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { ZP } from "../../constants/brand";

export function ScreenHeader({
  title, subtitle, onBack, right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14,
      gap: 10,
    }}>
      {onBack && (
        <Pressable onPress={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: ZP.bg2, alignItems: "center", justifyContent: "center",
        }}>
          <ArrowLeft size={18} color={ZP.text} />
        </Pressable>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 22, color: ZP.text, letterSpacing: -0.5 }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, marginTop: 2 }} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}
