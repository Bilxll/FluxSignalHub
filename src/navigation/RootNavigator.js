// src/navigation/RootNavigator.js
import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import SignalsListScreen from "../screens/SignalsListScreen";
import SignalDetailScreen from "../screens/SignalDetailScreen";
import AdminSignalFormScreen from "../screens/AdminSignalFormScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import AdminChallengeFormScreen from "../screens/AdminChallengeFormScreen";
import CompoundingScreen from "../screens/CompoundingScreen";
import AdminCompoundingFormScreen from "../screens/AdminCompoundingFormScreen";
import ChartsScreen from "../screens/ChartsScreen";

import { colors, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const TAB_ICONS = {
  Signals: "📈",
  Challenges: "🏆",
  Compounding: "📊",
  Charts: "🕯️"
};

function MainTabs() {
  const { logout } = useAuth() || {};

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.primary, fontWeight: "800" },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name]}</Text>,
        headerRight: () =>
          isAdmin && logout ? (
            <TouchableOpacity onPress={logout} style={{ marginRight: 16 }}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Logout</Text>
            </TouchableOpacity>
          ) : null
      })}
    >
      <Tabs.Screen name="Signals" component={SignalsListScreen} options={{ title: isAdmin ? "Manage Signals" : "Signals" }} />
      <Tabs.Screen name="Challenges" component={ChallengesScreen} options={{ title: "Challenges & Giveaways" }} />
      <Tabs.Screen name="Compounding" component={CompoundingScreen} options={{ title: "Compounding Tracker" }} />
      <Tabs.Screen name="Charts" component={ChartsScreen} options={{ title: "Charts" }} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.primary, fontWeight: "800" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="SignalDetail" component={SignalDetailScreen} options={{ title: "Signal Details" }} />
        {isAdmin && (
          <>
            <Stack.Screen
              name="AdminSignalForm"
              component={AdminSignalFormScreen}
              options={({ route }) => ({ title: route.params?.signal ? "Edit Signal" : "New Signal" })}
            />
            <Stack.Screen
              name="AdminChallengeForm"
              component={AdminChallengeFormScreen}
              options={({ route }) => ({
                title: route.params?.challenge
                  ? "Edit " + (route.params?.type === "giveaway" ? "Giveaway" : "Challenge")
                  : "New " + (route.params?.type === "giveaway" ? "Giveaway" : "Challenge")
              })}
            />
            <Stack.Screen
              name="AdminCompoundingForm"
              component={AdminCompoundingFormScreen}
              options={({ route }) => ({ title: route.params?.row ? "Edit Row" : "Add Row" })}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
