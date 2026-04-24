import React from "react";
import { Pressable, Text, View } from "react-native";
import { ZP } from "../../constants/brand";
import { StatusPill } from "./StatusPill";

export function DataRow({
  icon, title, subtitle, right, rightSub, status, onPress,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: string | React.ReactNode;
  rightSub?: string;
  status?: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={{
      flexDirection: "row", alignItems: "center",
      paddingVertical: 12, paddingHorizontal: 16, gap: 12,
    }}>
      {icon && (
        <View style={{
          width: 36, height: 36, borderRadius: 10,
          backgroundColor: ZP.bg2,
          alignItems: "center", justifyContent: "center",
        }}>{icon}</View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: ZP.font.sansSemi, fontSize: 14, color: ZP.text }}>{title}</Text>
        {subtitle && (
          <Text numberOfLines={1} style={{ fontFamily: ZP.font.sans, fontSize: 12, color: ZP.muted, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        {typeof right === "string" ? (
          <Text style={{
            fontFamily: ZP.font.monoMed, fontSize: 14, color: ZP.text,
            fontVariant: ["tabular-nums"] as const,
          }}>{right}</Text>
        ) : right}
        {rightSub && (
          <Text style={{ fontFamily: ZP.font.sans, fontSize: 11, color: ZP.muted }}>{rightSub}</Text>
        )}
        {status && <StatusPill status={status} />}
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} android_ripple={{ color: ZP.bg2 }}>
      {content}
    </Pressable>
  );
}
