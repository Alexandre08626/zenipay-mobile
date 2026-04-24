// Reusable "coming soon" screen for surfaces that are scaffolded but
// not yet wired end-to-end. Keeps the navigation complete without
// sprinkling ad-hoc placeholders everywhere.

import React from "react";
import { SafeAreaView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Sparkles } from "lucide-react-native";
import { ZP } from "../constants/brand";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { EmptyState } from "../components/ui/EmptyState";

export function StubScreen({
  title, subtitle, showBack = true,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  const nav = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ZP.bg0 }}>
      <ScreenHeader title={title} onBack={showBack ? () => nav.goBack() : undefined} />
      <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
        <EmptyState
          icon={<Sparkles size={28} color={ZP.violet} />}
          title="Coming soon"
          subtitle={subtitle ?? "This screen is on the roadmap. The web dashboard has full support today."}
        />
      </View>
    </SafeAreaView>
  );
}
