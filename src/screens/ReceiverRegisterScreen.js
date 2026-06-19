import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Alert, ScrollView,
  KeyboardAvoidingView, Platform, Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/UserContext";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

export default function ReceiverRegisterScreen({ navigation }) {
  const { register } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUsername = (u) => {
    if (u.length < 3) return "Username must be at least 3 characters";
    if (u.length > 20) return "Username must be under 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(u)) return "Only letters, numbers and underscores allowed";
    return null;
  };

  const handleRegister = async () => {
    if (!email || !password || !username || !confirm) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    const usernameError = validateUsername(username);
    if (usernameError) { Alert.alert("Invalid username", usernameError); return; }
    if (password !== confirm) { Alert.alert("Password mismatch", "Passwords do not match."); return; }
    if (password.length < 6) { Alert.alert("Weak password", "Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      await register(email.trim(), password, username.trim());
    } catch (e) {
      Alert.alert("Registration failed", e.message);
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
        <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>Join the FLUX Traders community</Text>

          <View style={styles.form}>
            <Field
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="e.g. goldtrader99"
              autoCapitalize="none"
              hint="Letters, numbers and underscores only"
            />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              secureTextEntry
            />
            <Field
              label="Confirm Password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat your password"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.btn}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={["#0B3D1E", "#00C853"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnInner}
            >
              <Text style={styles.btnText}>
                {loading ? "Creating account..." : "Create Account"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("ReceiverLogin")}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

function Field({ label, hint, ...props }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: spacing.lg, paddingTop: spacing.xl, alignItems: "center" },
  logo: { width: 90, height: 90, marginBottom: spacing.md },
  title: { fontSize: fontSizes.xxl, fontWeight: "800", color: colors.white, marginBottom: 6 },
  sub: { fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: spacing.xl },
  form: { width: "100%", marginBottom: spacing.md },
  fieldWrap: { marginBottom: spacing.md, width: "100%" },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    fontSize: fontSizes.md,
    color: colors.white,
    width: "100%"
  },
  hint: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 4 },
  btn: { width: "100%", borderRadius: radius.md, overflow: "hidden", marginBottom: spacing.md },
  btnInner: { paddingVertical: 15, alignItems: "center" },
  btnText: { color: colors.white, fontWeight: "800", fontSize: fontSizes.md },
  loginLink: { paddingVertical: spacing.sm },
  loginLinkText: { color: colors.textMuted, fontSize: fontSizes.sm }
});