import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import SignalsListScreen from "../screens/SignalsListScreen";
import SignalDetailScreen from "../screens/SignalDetailScreen";
import AdminSignalFormScreen from "../screens/AdminSignalFormScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import AdminChallengeFormScreen from "../screens/AdminChallengeFormScreen";
import CompoundingScreen from "../screens/CompoundingScreen";
import AdminCompoundingFormScreen from "../screens/AdminCompoundingFormScreen";
import ChartsScreen from "../screens/ChartsScreen";
import TradeHistoryScreen from "../screens/TradeHistoryScreen";
import AdminTradeFormScreen from "../screens/AdminTradeFormScreen";
import MembersScreen from "../screens/MembersScreen";
import AdminMemberTierFormScreen from "../screens/AdminMemberTierFormScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import AnalystsScreen from "../screens/AnalystsScreen";
import AdminAnalystFormScreen from "../screens/AdminAnalystFormScreen";
import WatchlistScreen from "../screens/WatchlistScreen";

import { colors, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const TABS = [
  { name: "Home", icon: "🏠", label: "Home" },
  { name: "Signals", icon: "📈", label: "Signals" },
  { name: "Challenges", icon: "🏆", label: "Challenges" },
  { name: "Compounding", icon: "📊", label: "Compound" },
  { name: "Charts", icon: "🕯️", label: "Charts" },
  { name: "History", icon: "📋", label: "History" },
  { name: "Members", icon: "👑", label: "Members" },
  { name: "Leaderboard", icon: "🥇", label: "Rankings" },
  { name: "Analysts", icon: "👤", label: "Analysts" },
  { name: "Watchlist", icon: "👁️", label: "Watchlist" }
];

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const tab = TABS.find(t => t.name === route.name);
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => navigation.navigate(route.name)}
          >
            <Text style={styles.tabIcon}>{tab?.icon}</Text>
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? colors.primary : colors.textMuted }
            ]}>
              {tab?.label}
            </Text>
            {isFocused && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  const { logout } = useAuth() || {};

  const headerStyle = {
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { color: colors.text, fontWeight: "800" },
    headerShadowVisible: false,
    headerTintColor: colors.primary,
    headerRight: () =>
      isAdmin && logout ? (
        <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      ) : null
  };

  return (
    <Tabs.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={headerStyle}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: "FLUX Traders", ...headerStyle }} />
      <Tabs.Screen name="Signals" component={SignalsListScreen} options={{ title: isAdmin ? "Manage Signals" : "Signals", ...headerStyle }} />
      <Tabs.Screen name="Challenges" component={ChallengesScreen} options={{ title: "Challenges", ...headerStyle }} />
      <Tabs.Screen name="Compounding" component={CompoundingScreen} options={{ title: "Compounding", ...headerStyle }} />
      <Tabs.Screen name="Charts" component={ChartsScreen} options={{ title: "Charts", ...headerStyle }} />
      <Tabs.Screen name="History" component={TradeHistoryScreen} options={{ title: "Trade History", ...headerStyle }} />
      <Tabs.Screen name="Members" component={MembersScreen} options={{ title: "Members Area", ...headerStyle }} />
      <Tabs.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: "Leaderboard", ...headerStyle }} />
      <Tabs.Screen name="Analysts" component={AnalystsScreen} options={{ title: "Our Analysts", ...headerStyle }} />
      <Tabs.Screen name="Watchlist" component={WatchlistScreen} options={{ title: "Watchlist", ...headerStyle }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontWeight: "800" },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="SignalDetail" component={SignalDetailScreen} options={{ title: "Signal Details" }} />
        {isAdmin && (
          <>
            <Stack.Screen name="AdminSignalForm" component={AdminSignalFormScreen} options={({ route }) => ({ title: route.params?.signal ? "Edit Signal" : "New Signal" })} />
            <Stack.Screen name="AdminChallengeForm" component={AdminChallengeFormScreen} options={({ route }) => ({ title: route.params?.challenge ? "Edit" : "New " + (route.params?.type === "giveaway" ? "Giveaway" : "Challenge") })} />
            <Stack.Screen name="AdminCompoundingForm" component={AdminCompoundingFormScreen} options={({ route }) => ({ title: route.params?.row ? "Edit Row" : "Add Row" })} />
            <Stack.Screen name="AdminTradeForm" component={AdminTradeFormScreen} options={{ title: "Log Trade" }} />
            <Stack.Screen name="AdminMemberTierForm" component={AdminMemberTierFormScreen} options={({ route }) => ({ title: route.params?.tier ? "Edit Tier" : "Create Tier" })} />
            <Stack.Screen name="AdminAnalystForm" component={AdminAnalystFormScreen} options={({ route }) => ({ title: route.params?.analyst ? "Edit Analyst" : "Add Analyst" })} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    paddingBottom: 20,
    paddingTop: 8
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    position: "relative"
  },
  tabIcon: { fontSize: 18 },
  tabLabel: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2
  },
  tabIndicator: {
    position: "absolute",
    top: -8,
    width: 20,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2
  }
});