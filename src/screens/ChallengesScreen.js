// src/screens/ChallengesScreen.js
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import TradingChallengeScreen from "./TradingChallengeScreen";
import GiveawayScreen from "./GiveawayScreen";
import { colors, fontSizes } from "../theme/colors";

const TopTabs = createMaterialTopTabNavigator();

export default function ChallengesScreen() {
  return (
    <TopTabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIndicatorStyle: { backgroundColor: colors.primary, height: 3 },
        tabBarStyle: { backgroundColor: colors.background, elevation: 0, shadowOpacity: 0 },
        tabBarLabelStyle: { fontWeight: "700", fontSize: fontSizes.sm, textTransform: "none" }
      }}
    >
      <TopTabs.Screen name="TradingChallenges" component={TradingChallengeScreen} options={{ title: "Trading Challenges" }} />
      <TopTabs.Screen name="Giveaways" component={GiveawayScreen} options={{ title: "Giveaways" }} />
    </TopTabs.Navigator>
  );
}
