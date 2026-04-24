// ZeniPay mobile brand tokens. Mirror of the web app's
// /lib/design-system/zenipay-brand.ts — kept minimal (colours +
// gradient) so the mobile bundle stays lean.

export const ZP = {
  green:   "#10B981",
  cyan:    "#15B8C9",
  violet:  "#7B4FBF",
  pink:    "#FF6B9D",

  bg0:     "#FFFFFF",
  bg1:     "#FAFBFF",
  bg2:     "#F4F6FB",

  border:  "#E5E8F0",
  text:    "#0F172A",
  muted:   "#475569",
  dim:     "#94A3B8",

  danger:  "#DC2626",
  warning: "#D97706",
  success: "#16A34A",

  // 3-stop gradient — always in this order for signifier CTAs.
  gradient: ["#10B981", "#15B8C9", "#7B4FBF"] as const,
} as const;

export function hashHue(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function fmtMoney(units: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency }).format(units);
  } catch {
    return `${units.toFixed(2)} ${currency}`;
  }
}
