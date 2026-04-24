import React from "react";
import { Pressable, Text, View } from "react-native";
import { ZP } from "../../constants/brand";

export function SectionHeader({
  title, action, onActionPress,
}: { title: string; action?: string; onActionPress?: () => void }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center",
      marginTop: 22, marginBottom: 10,
    }}>
      <Text style={{ flex: 1, fontFamily: ZP.font.sansBold, fontSize: 16, color: ZP.text, letterSpacing: -0.2 }}>
        {title}
      </Text>
      {action && (
        <Pressable onPress={onActionPress}>
          <Text style={{ fontFamily: ZP.font.sansSemi, fontSize: 13, color: ZP.cyan }}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
