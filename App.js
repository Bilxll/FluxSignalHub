// App.js
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import RootNavigator from "./src/navigation/RootNavigator";
import LoginScreen from "./src/screens/LoginScreen";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { registerForPushNotificationsAsync } from "./src/utils/notifications";
import { isAdmin } from "./src/utils/appVariant";
import { colors } from "./src/theme/colors";

function ReceiverApp() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return <RootNavigator />;
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
      <StatusBar style="dark" backgroundColor={colors.background} />
      {isAdmin ? (
        <AuthProvider>
          <AdminApp />
        </AuthProvider>
      ) : (
        <ReceiverApp />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }
});
