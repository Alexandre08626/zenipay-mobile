// Monospace currency amount with a simple count-up animation on value
// change. Sizes: sm / md / lg / xl.

import React, { useEffect, useRef, useState } from "react";
import { Platform, Text, TextStyle } from "react-native";
import { ZP, fmtMoney } from "../../constants/brand";

const SIZE_MAP: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 18, md: 26, lg: 40, xl: 56,
};

export function BalanceAmount({
  amount, currency = "CAD", size = "md", style,
}: {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  style?: TextStyle;
}) {
  const [display, setDisplay] = useState(amount);
  const startRef = useRef(amount);

  useEffect(() => {
    const from = startRef.current;
    const to = amount;
    if (from === to) return;
    const duration = 350;
    const t0 = Date.now();
    let raf: number | null = null;
    const step = () => {
      const t = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
      else startRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => { if (raf != null) cancelAnimationFrame(raf); };
  }, [amount]);

  return (
    <Text style={[{
      fontSize: SIZE_MAP[size],
      fontWeight: "800",
      color: ZP.text,
      letterSpacing: -0.5,
      fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
      ...(Platform.OS === "ios" ? { fontFamily: "Menlo" } : { fontFamily: "monospace" }),
    }, style]}>
      {fmtMoney(display, currency)}
    </Text>
  );
}
