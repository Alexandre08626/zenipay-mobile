// ZeniPay brand tokens — mirror of the web app's design system.

export const ZP = {
  // Brand palette
  green:   "#10B981",
  cyan:    "#15B8C9",
  violet:  "#7B4FBF",
  pink:    "#FF6B9D",
  orange:  "#FFA500",

  // Surfaces
  bg0:     "#FFFFFF",
  bg1:     "#FAFBFF",
  bg2:     "#F4F6FB",
  bg3:     "#ECEFF5",

  // Borders
  border:       "#E5E8F0",
  borderHover:  "#D1D6E3",

  // Text
  text:  "#0F172A",
  muted: "#475569",
  dim:   "#94A3B8",

  // Semantic
  success:    "#10B981",
  successBg:  "#ECFDF5",
  warning:    "#F59E0B",
  warningBg:  "#FFFBEB",
  danger:     "#EF4444",
  dangerBg:   "#FEF2F2",
  info:       "#0EA5E9",
  infoBg:     "#EFF6FF",

  // Signature 3-stop gradient
  gradient: ["#10B981", "#15B8C9", "#7B4FBF"] as const,
  gradientCyan: ["#15B8C9", "#0EA5E9"] as const,
  gradientViolet: ["#7B4FBF", "#9333EA"] as const,

  // Typography
  font: {
    sans: "Inter_400Regular",
    sansMed: "Inter_500Medium",
    sansSemi: "Inter_600SemiBold",
    sansBold: "Inter_700Bold",
    mono: "JetBrainsMono_400Regular",
    monoMed: "JetBrainsMono_500Medium",
  },
} as const;

export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function fmtMoney(units: number, currency = "CAD"): string {
  try {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(units);
  } catch {
    return `${(units ?? 0).toFixed(2)} ${currency}`;
  }
}

export function fmtDate(d: string | Date | number): string {
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtTime(d: string | Date | number): string {
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
}

export function maskAccount(num?: string | null, tail = 4): string {
  if (!num) return "•••• ••••";
  const t = num.slice(-tail);
  return `•••• •••• ${t}`;
}
