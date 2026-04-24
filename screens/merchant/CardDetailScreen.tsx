import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StubScreen } from "../_StubScreen";

export function CardDetailScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _nav = useNavigation(); const _route = useRoute();
  return <StubScreen title="Card details" subtitle="Reveal PAN / CVV, freeze, adjust limits. Ships in the next release behind Face ID." />;
}
