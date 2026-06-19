import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RootNavigator from "./src/navigation/RootNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import ReceiverLoginScreen from "./src/screens/ReceiverLoginScreen";
import ReceiverRegisterScreen from "./src/screens/ReceiverRegisterScreen";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { UserProvider, useUser } from "./src/context/UserContext";
import { registerForPushNotificationsAsync } from "./src/utils/notifications";
import { isAdmin } from "./src/utils/appVariant";
import { colors } from "./src/theme/colors";

const Stack = createNativeStackNavigator();

function ReceiverAuthStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
        headerTintColor: colors.primary
      }}>
        <Stack.Screen name="ReceiverLogin" component={ReceiverLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ReceiverRegister" component={ReceiverRegisterScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function ReceiverApp() {
  const { user, initializing } = useUser();

  useEffect(() => {
    if (user) registerForPushNotificationsAsync();
  }, [user]);

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <RootNavigator /> : <ReceiverAuthStack />;
}

function AdminApp() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return user ? <RootNavigator /> : <LoginScreen />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={colors.background} />
      {isAdmin ? (
        <AuthProvider>
          <AdminApp />
        </AuthProvider>
      ) : (
        <UserProvider>
          <ReceiverApp />
        </UserProvider>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }
});