import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BookOpen, Bot, LayoutDashboard, Menu, Vault } from "lucide-react-native";
import { ZP } from "../constants/brand";
import { AgentsOverviewScreen } from "../screens/agents/OverviewScreen";
import { TreasuryScreen } from "../screens/agents/TreasuryScreen";
import { AgentsScreen } from "../screens/agents/AgentsScreen";
import { LedgerScreen } from "../screens/agents/LedgerScreen";
import { MoreAgentsScreen } from "../screens/agents/MoreScreen";

const Tab = createBottomTabNavigator();

export function AgentsTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ZP.violet,
        tabBarInactiveTintColor: ZP.dim,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: ZP.border,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: { fontFamily: ZP.font.sansSemi, fontSize: 10, letterSpacing: 0.3, marginBottom: 4 },
        tabBarIcon: ({ color, size }) => {
          const s = size ?? 22;
          switch (route.name) {
            case "Overview":  return <LayoutDashboard size={s} color={color} />;
            case "Treasury":  return <Vault           size={s} color={color} />;
            case "Agents":    return <Bot             size={s} color={color} />;
            case "Ledger":    return <BookOpen        size={s} color={color} />;
            case "More":      return <Menu            size={s} color={color} />;
            default:          return null;
          }
        },
      })}
    >
      <Tab.Screen name="Overview" component={AgentsOverviewScreen} />
      <Tab.Screen name="Treasury" component={TreasuryScreen} />
      <Tab.Screen name="Agents"   component={AgentsScreen} />
      <Tab.Screen name="Ledger"   component={LedgerScreen} />
      <Tab.Screen name="More"     component={MoreAgentsScreen} />
    </Tab.Navigator>
  );
}
