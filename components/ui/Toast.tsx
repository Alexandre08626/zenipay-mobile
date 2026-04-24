import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { X } from "lucide-react-native";
import { ZP } from "../../constants/brand";

type Tone = "success" | "error" | "info" | "warning";
type Toast = { id: number; msg: string; tone: Tone };

interface Ctx {
  show: (msg: string, tone?: Tone) => void;
}

const ToastCtx = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("useToast must be used inside ToastProvider");
  return c;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Toast[]>([]);
  const seq = useRef(0);

  const show = useCallback((msg: string, tone: Tone = "info") => {
    const id = ++seq.current;
    setStack((s) => [...s, { id, msg, tone }]);
    setTimeout(() => setStack((s) => s.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <View pointerEvents="box-none" style={{
        position: "absolute", top: 60, left: 14, right: 14, zIndex: 1000, gap: 8,
      }}>
        {stack.map((t) => <ToastRow key={t.id} toast={t} onDismiss={() => setStack((s) => s.filter((x) => x.id !== t.id))} />)}
      </View>
    </ToastCtx.Provider>
  );
}

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const y = useRef(new Animated.Value(-60)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }),
      Animated.timing(op, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [y, op]);

  const bg = toast.tone === "success" ? ZP.successBg : toast.tone === "error" ? ZP.dangerBg : toast.tone === "warning" ? ZP.warningBg : ZP.infoBg;
  const fg = toast.tone === "success" ? ZP.success   : toast.tone === "error" ? ZP.danger   : toast.tone === "warning" ? ZP.warning   : ZP.info;

  return (
    <Animated.View style={{
      transform: [{ translateY: y }], opacity: op,
      backgroundColor: "#fff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: ZP.border,
      shadowColor: "#0f172a",
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, gap: 10 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: fg }} />
        <Text style={{
          flex: 1, fontFamily: ZP.font.sansSemi, fontSize: 13, color: ZP.text,
        }}>{toast.msg}</Text>
        <Pressable onPress={onDismiss} style={{ padding: 4 }}>
          <X size={14} color={ZP.muted} />
        </Pressable>
      </View>
      <View style={{ height: 3, backgroundColor: bg, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }} />
    </Animated.View>
  );
}
