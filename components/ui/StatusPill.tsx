import React from "react";
import { Text, View } from "react-native";
import { ZP } from "../../constants/brand";

type Preset =
  | "active" | "pending" | "approved" | "rejected" | "denied"
  | "expired" | "canceled" | "warning" | "critical" | "info"
  | "completed" | "processing" | "failed";

const MAP: Record<Preset, { bg: string; fg: string }> = {
  active:     { bg: ZP.successBg, fg: ZP.success },
  approved:   { bg: ZP.successBg, fg: ZP.success },
  completed:  { bg: ZP.successBg, fg: ZP.success },
  pending:    { bg: ZP.warningBg, fg: ZP.warning },
  processing: { bg: ZP.warningBg, fg: ZP.warning },
  warning:    { bg: ZP.warningBg, fg: ZP.warning },
  rejected:   { bg: ZP.dangerBg,  fg: ZP.danger },
  denied:     { bg: ZP.dangerBg,  fg: ZP.danger },
  critical:   { bg: ZP.dangerBg,  fg: ZP.danger },
  failed:     { bg: ZP.dangerBg,  fg: ZP.danger },
  expired:    { bg: ZP.bg3,       fg: ZP.muted },
  canceled:   { bg: ZP.bg3,       fg: ZP.muted },
  info:       { bg: ZP.infoBg,    fg: ZP.info },
};

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const preset = (status.toLowerCase() as Preset);
  const c = MAP[preset] ?? { bg: ZP.bg3, fg: ZP.muted };
  return (
    <View style={{
      alignSelf: "flex-start",
      paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999,
      backgroundColor: c.bg,
    }}>
      <Text style={{
        color: c.fg, fontSize: 10, fontFamily: ZP.font.sansBold,
        letterSpacing: 0.8, textTransform: "uppercase",
      }}>
        {label ?? status.replace(/_/g, " ")}
      </Text>
    </View>
  );
}
