import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Alert, Image,
  KeyboardAvoidingView, Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

export default function ReceiverLoginScreen({ navigation }) {
  const { login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert("Login failed", e.message.includes("user-not-found") || e.message.includes("wrong-password")
        ? "Invalid email or password." : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#0B3D1E", "#0A0A0F", "#0A0A0F"]}
        style={styles.container}
      >
        <View style={styles.inner}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.sub}>Sign in to your FLUX account</Text>

          <View style={styles.form}>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={["#0B3D1E", "#00C853"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnInner}
            >
              <Text style={styles.btnText}>{loading ? "Signing in..." : "Sign In"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate("ReceiverRegister")}
          >
            <Text style={styles.registerLinkText}>
              New here?{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: spacing.lg, paddingTop: 80, alignItems: "center" },
  logo: { width: 100, height: 100, marginBottom: spacing.lg },
  title: { fontSize: fontSizes.xxl, fontWeight: "800", color: colors.white, marginBottom: 6 },
  sub: { fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: spacing.xl },
  form: { width: "100%", marginBottom: spacing.md },
  fieldWrap: { marginBottom: spacing.md },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    fontSize: fontSizes.md,
    color: colors.white
  },
  btn: { width: "100%", borderRadius: radius.md, overflow: "hidden", marginBottom: spacing.md },
  btnInner: { paddingVertical: 15, alignItems: "center" },
  btnText: { color: colors.white, fontWeight: "800", fontSize: fontSizes.md },
  registerLink: { paddingVertical: spacing.sm },
  registerLinkText: { color: colors.textMuted, fontSize: fontSizes.sm }
});