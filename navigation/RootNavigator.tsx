import React from "react";
import { NavigationContainer, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ZP } from "../constants/brand";
import { useAppMode } from "../lib/app-mode";
import { ModeSelectorScreen } from "../screens/ModeSelectorScreen";
import { MerchantTabs } from "./MerchantTabs";
import { AgentsTabs } from "./AgentsTabs";

// Shared detail screens accessible from both modes.
import { AccountDetailScreen } from "../screens/merchant/AccountDetailScreen";
import { TransactionDetailScreen } from "../screens/merchant/TransactionDetailScreen";
import { TransactionsScreen } from "../screens/merchant/TransactionsScreen";
import { CardDetailScreen } from "../screens/merchant/CardDetailScreen";
import { InvoicesScreen } from "../screens/merchant/InvoicesScreen";
import { ContactsScreen } from "../screens/merchant/ContactsScreen";
import { PaymentLinksScreen } from "../screens/merchant/PaymentLinksScreen";
import { MerchantSettingsScreen } from "../screens/merchant/SettingsScreen";
import { AgentDetailScreen } from "../screens/agents/AgentDetailScreen";
import { ZeniCardsScreen } from "../screens/agents/ZeniCardsScreen";
import { ZeniCardDetailScreen } from "../screens/agents/ZeniCardDetailScreen";
import { ApprovalsScreen } from "../screens/agents/ApprovalsScreen";
import { AuditScreen } from "../screens/agents/AuditScreen";
import { ComplianceScreen } from "../screens/agents/ComplianceScreen";
import { AgentsSettingsScreen } from "../screens/agents/SettingsScreen";

export type RootStackParamList = {
  ModeSelector: undefined;
  MerchantTabs: undefined;
  AgentsTabs: undefined;

  // Detail / modal routes
  AccountDetail: { id: string };
  TransactionDetail: { id: string };
  Transactions: undefined;
  CardDetail: { id: string };
  Invoices: undefined;
  Contacts: undefined;
  PaymentLinks: undefined;
  MerchantSettings: undefined;

  AgentDetail: { id: string };
  ZeniCards: undefined;
  ZeniCardDetail: { id: string };
  Approvals: undefined;
  Audit: undefined;
  Compliance: undefined;
  AgentsSettings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const THEME: Theme = {
  dark: false,
  colors: {
    primary:     ZP.cyan,
    background:  ZP.bg0,
    card:        "#fff",
    text:        ZP.text,
    border:      ZP.border,
    notification: ZP.violet,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" },
    medium:  { fontFamily: "System", fontWeight: "600" },
    bold:    { fontFamily: "System", fontWeight: "800" },
    heavy:   { fontFamily: "System", fontWeight: "900" },
  },
};

export function RootNavigator() {
  const { mode } = useAppMode();

  return (
    <NavigationContainer theme={THEME}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: ZP.bg0 } }}>
        {mode == null ? (
          <Stack.Screen name="ModeSelector" component={ModeSelectorScreen} />
        ) : mode === "merchant" ? (
          <Stack.Screen name="MerchantTabs" component={MerchantTabs} />
        ) : (
          <Stack.Screen name="AgentsTabs" component={AgentsTabs} />
        )}

        <Stack.Screen name="AccountDetail"     component={AccountDetailScreen} />
        <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
        <Stack.Screen name="Transactions"      component={TransactionsScreen} />
        <Stack.Screen name="CardDetail"        component={CardDetailScreen} />
        <Stack.Screen name="Invoices"          component={InvoicesScreen} />
        <Stack.Screen name="Contacts"          component={ContactsScreen} />
        <Stack.Screen name="PaymentLinks"      component={PaymentLinksScreen} />
        <Stack.Screen name="MerchantSettings"  component={MerchantSettingsScreen} />

        <Stack.Screen name="AgentDetail"      component={AgentDetailScreen} />
        <Stack.Screen name="ZeniCards"        component={ZeniCardsScreen} />
        <Stack.Screen name="ZeniCardDetail"   component={ZeniCardDetailScreen} />
        <Stack.Screen name="Approvals"        component={ApprovalsScreen} />
        <Stack.Screen name="Audit"            component={AuditScreen} />
        <Stack.Screen name="Compliance"       component={ComplianceScreen} />
        <Stack.Screen name="AgentsSettings"   component={AgentsSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
