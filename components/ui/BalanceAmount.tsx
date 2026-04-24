import React, { useEffect, useRef, useState } from "react";
import { Text, TextStyle } from "react-native";
import { ZP, fmtMoney } from "../../constants/brand";

const SIZE: Record<"sm" | "md" | "lg" | "xl" | "hero", number> = {
  sm: 16, md: 22, lg: 34, xl: 42, hero: 52,
};

export function BalanceAmount({
  amount, currency = "CAD", size = "md", style, negativeAsDanger = true,
}: {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  style?: TextStyle;
  negativeAsDanger?: boolean;
}) {
  const [display, setDisplay] = useState(amount);
  const startRef = useRef(amount);

  useEffect(() => {
    const from = startRef.current;
    const to = amount;
    if (from === to) return;
    const duration = 420;
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

  const fs = SIZE[size];
  const color = negativeAsDanger && display < 0 ? ZP.danger : ZP.text;

  return (
    <Text style={[{
      fontSize: fs,
      fontFamily: ZP.font.monoMed,
      color,
      letterSpacing: size === "hero" || size === "xl" ? -0.8 : -0.3,
      fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
    }, style]}>
      {fmtMoney(display, currency)}
    </Text>
  );
}
