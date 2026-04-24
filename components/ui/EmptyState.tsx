import React from "react";
import { Text, View } from "react-native";
import { ZP } from "../../constants/brand";
import { GradientButton } from "./GradientButton";

export function EmptyState({
  icon, title, subtitle, action, onActionPress,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={{
      alignItems: "center", justifyContent: "center",
      padding: 32, borderRadius: 16,
      backgroundColor: "#fff", borderWidth: 1, borderColor: ZP.border,
      gap: 10,
    }}>
      {icon}
      <Text style={{ fontFamily: ZP.font.sansBold, fontSize: 16, color: ZP.text, textAlign: "center" }}>{title}</Text>
      {subtitle && (
        <Text style={{ fontFamily: ZP.font.sans, fontSize: 13, color: ZP.muted, textAlign: "center", maxWidth: 320, lineHeight: 18 }}>
          {subtitle}
        </Text>
      )}
      {action && onActionPress && (
        <View style={{ marginTop: 8 }}>
          <GradientButton label={action} onPress={onActionPress} size="md" />
        </View>
      )}
    </View>
  );
}
