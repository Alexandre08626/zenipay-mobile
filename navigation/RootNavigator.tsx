// Root navigator with a white-themed bottom tab for the 4 core
// surfaces (Home / Agents / Approvals / Accounts). On iOS the default
// dark theme bleeds through, so we hand-roll a light navigation theme
// built on the ZeniPay tokens.

import React from "react";
import { NavigationContainer, Theme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Bot, CheckSquare, Wallet } from "lucide-react-native";
import { ZP } from "../constants/brand";
import { HomeScreen } from "../screens/HomeScreen";
import { AgentsScreen } from "../screens/AgentsScreen";
import { ApprovalsScreen } from "../screens/ApprovalsScreen";
import { AccountsScreen } from "../screens/AccountsScreen";

const Tab = createBottomTabNavigator();

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
  // Type-safe for @react-navigation v7.
  fonts: {
    regular:  { fontFamily: "System", fontWeight: "400" },
    medium:   { fontFamily: "System", fontWeight: "600" },
    bold:     { fontFamily: "System", fontWeight: "800" },
    heavy:    { fontFamily: "System", fontWeight: "900" },
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={THEME}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: ZP.cyan,
          tabBarInactiveTintColor: ZP.dim,
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: ZP.border,
            paddingTop: 6,
            height: 62,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
          tabBarIcon: ({ color, size }) => {
            const s = size ?? 22;
            switch (route.name) {
              case "Home":      return <Home       size={s} color={color} />;
              case "Agents":    return <Bot        size={s} color={color} />;
              case "Approvals": return <CheckSquare size={s} color={color} />;
              case "Accounts":  return <Wallet     size={s} color={color} />;
              default:          return null;
            }
          },
        })}
      >
        <Tab.Screen name="Home">
          {() => <HomeScreenWithNav />}
        </Tab.Screen>
        <Tab.Screen name="Agents">
          {() => <AgentsScreenWithNav />}
        </Tab.Screen>
        <Tab.Screen name="Approvals">
          {() => <ApprovalsScreen />}
        </Tab.Screen>
        <Tab.Screen name="Accounts">
          {() => <AccountsScreen />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// These wrappers inject navigation helpers so the screens stay
// navigation-library-agnostic (easier to migrate to Expo Router later).
function HomeScreenWithNav() {
  return <HomeScreen goAgents={() => { /* handled by tab bar */ }} goWallets={() => { /* future */ }} goApprovals={() => { /* handled by tab bar */ }} />;
}
function AgentsScreenWithNav() {
  return <AgentsScreen onOpenAgent={() => { /* future: stack push */ }} />;
}
