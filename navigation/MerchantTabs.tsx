import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ArrowLeftRight, CreditCard, LayoutDashboard, Menu, Wallet } from "lucide-react-native";
import { ZP } from "../constants/brand";
import { OverviewScreen } from "../screens/merchant/OverviewScreen";
import { AccountsScreen } from "../screens/merchant/AccountsScreen";
import { TransferScreen } from "../screens/merchant/TransferScreen";
import { CardsScreen } from "../screens/merchant/CardsScreen";
import { MoreMerchantScreen } from "../screens/merchant/MoreScreen";

const Tab = createBottomTabNavigator();

export function MerchantTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ZP.cyan,
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
            case "Accounts":  return <Wallet          size={s} color={color} />;
            case "Transfer":  return <ArrowLeftRight  size={s} color={color} />;
            case "Cards":     return <CreditCard      size={s} color={color} />;
            case "More":      return <Menu            size={s} color={color} />;
            default:          return null;
          }
        },
      })}
    >
      <Tab.Screen name="Overview" component={OverviewScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Transfer" component={TransferScreen} />
      <Tab.Screen name="Cards"    component={CardsScreen} />
      <Tab.Screen name="More"     component={MoreMerchantScreen} />
    </Tab.Navigator>
  );
}
