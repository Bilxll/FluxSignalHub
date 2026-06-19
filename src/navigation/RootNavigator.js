import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, ScrollView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";

import HomeScreen from "../screens/HomeScreen";
import SignalsListScreen from "../screens/SignalsListScreen";
import SignalDetailScreen from "../screens/SignalDetailScreen";
import AdminSignalFormScreen from "../screens/AdminSignalFormScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import AdminChallengeFormScreen from "../screens/AdminChallengeFormScreen";
import ChartsScreen from "../screens/ChartsScreen";
import TradeHistoryScreen from "../screens/TradeHistoryScreen";
import AdminTradeFormScreen from "../screens/AdminTradeFormScreen";
import MembersScreen from "../screens/MembersScreen";
import AdminMemberTierFormScreen from "../screens/AdminMemberTierFormScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import AnalystsScreen from "../screens/AnalystsScreen";
import AdminAnalystFormScreen from "../screens/AdminAnalystFormScreen";
import WatchlistScreen from "../screens/WatchlistScreen";
import ChatScreen from "../screens/ChatScreen";
import ClassesScreen from "../screens/ClassesScreen";
import AdminClassFormScreen from "../screens/AdminClassFormScreen";
import CompoundingScreen from "../screens/CompoundingScreen";
import AdminCompoundingFormScreen from "../screens/AdminCompoundingFormScreen";

import { colors, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const TABS = [
  { name: "Home", icon: "ti-home", label: "Home" },
  { name: "Signals", icon: "ti-chart-candle", label: "Signals" },
  { name: "Challenges", icon: "ti-trophy", label: "Challenges" },
  { name: "Chat", icon: "ti-message-circle", label: "Chat" },
  { name: "Classes", icon: "ti-school", label: "Classes" },
  { name: "Charts", icon: "ti-chart-line", label: "Charts" },
  { name: "History", icon: "ti-clipboard-list", label: "History" },
  { name: "Members", icon: "ti-crown", label: "Members" },
  { name: "Leaderboard", icon: "ti-medal", label: "Rankings" },
  { name: "Analysts", icon: "ti-user-circle", label: "Analysts" },
  { name: "Watchlist", icon: "ti-eye", label: "Watchlist" },
  { name: "Compounding", icon: "ti-trending-up", label: "Compound" }
];

function GlassIcon({ icon, active }) {
  return (
    <View style={[styles.glassIcon, active && styles.glassIconActive]}>
      <View style={[styles.glassShine, active && styles.glassShinActive]} />
      <Text style={[styles.tablerIcon, { color: active ? colors.primary : "rgba(255,255,255,0.35)" }]}>
        {/* We render via a Text with a Unicode space + the icon class name approach */}
      </Text>
    </View>
  );
}

function CustomTabBar({ state, navigation }) {
  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBarInner}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {state.routes.map((route, index) => {
            const tab = TABS.find(t => t.name === route.name);
            const active = state.index === index;
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.glassIcon, active && styles.glassIconActive]}>
                  <View style={styles.glassShine} />
                  <Text
                    style={[
                      styles.iconText,
                      { color: active ? colors.primary : "rgba(255,255,255,0.35)" }
                    ]}
                  >
                    {getIcon(tab?.icon)}
                  </Text>
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab?.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

// Map icon names to Unicode characters from Tabler Icons font
function getIcon(name) {
  const map = {
    "ti-home": "󰋞",
    "ti-chart-candle": "󱧘",
    "ti-trophy": "󰏃",
    "ti-message-circle": "󰍦",
    "ti-school": "󱆀",
    "ti-chart-line": "󰄧",
    "ti-clipboard-list": "󰓒",
    "ti-crown": "󱒸",
    "ti-medal": "󰆼",
    "ti-user-circle": "󰀄",
    "ti-eye": "󰈈",
    "ti-trending-up": "󰇘"
  };
  return map[name] || "●";
}

function NavIcon({ name, active }) {
  const iconMap = {
    "ti-home": "🏠", "ti-chart-candle": "📈", "ti-trophy": "🏆",
    "ti-message-circle": "💬", "ti-school": "🎓", "ti-chart-line": "📉",
    "ti-clipboard-list": "📋", "ti-crown": "👑", "ti-medal": "🥇",
    "ti-user-circle": "👤", "ti-eye": "👁", "ti-trending-up": "📊"
  };
  return iconMap[name] || "●";
}

function CustomTabBar2({ state, navigation }) {
  return (
    <View style={styles.tabBarOuter}>
      <View style={styles.tabBarInner}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}
        >
          {state.routes.map((route, index) => {
            const tab = TABS.find(t => t.name === route.name);
            const active = state.index === index;
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.tabItem}
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.glassIcon, active && styles.glassIconActive]}>
                  <View style={styles.glassShine} />
                  <Text style={styles.navEmoji}>{NavIcon({ name: tab?.icon })}</Text>
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {tab?.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

function MainTabs() {
  const { logout } = useAuth() || {};

  const headerOpts = {
    headerTransparent: true,
    headerTitleStyle: { color: colors.text, fontWeight: "800", fontSize: fontSizes.lg },
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
      tabBar={props => <CustomTabBar2 {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Signals" component={SignalsListScreen} />
      <Tabs.Screen name="Challenges" component={ChallengesScreen} />
      <Tabs.Screen name="Chat" component={ChatScreen} />
      <Tabs.Screen name="Classes" component={ClassesScreen} />
      <Tabs.Screen name="Charts" component={ChartsScreen} />
      <Tabs.Screen name="History" component={TradeHistoryScreen} />
      <Tabs.Screen name="Members" component={MembersScreen} />
      <Tabs.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tabs.Screen name="Analysts" component={AnalystsScreen} />
      <Tabs.Screen name="Watchlist" component={WatchlistScreen} />
      <Tabs.Screen name="Compounding" component={CompoundingScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTransparent: true,
          headerTitleStyle: { color: colors.text, fontWeight: "800" },
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: "transparent" }
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
            <Stack.Screen name="AdminClassForm" component={AdminClassFormScreen} options={({ route }) => ({ title: route.params?.classItem ? "Edit Class" : "New Class" })} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    backgroundColor: "rgba(5,10,14,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingBottom: 20,
    paddingTop: 10
  },
  tabBarInner: { flexDirection: "row" },
  tabBarScroll: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 6,
    alignItems: "center"
  },
  tabItem: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 2
  },
  glassIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative"
  },
  glassIconActive: {
    backgroundColor: "rgba(0,200,83,0.13)",
    borderColor: "rgba(0,200,83,0.32)"
  },
  glassShine: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14
  },
  navEmoji: { fontSize: 20 },
  tabLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.28)",
    fontWeight: "600"
  },
  tabLabelActive: { color: colors.primary }
});