import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, TouchableOpacity, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

export default function AdminAnalystFormScreen({ route, navigation }) {
  const existing = route.params?.analyst;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name || "");
  const [role, setRole] = useState(existing?.role || "");
  const [speciality, setSpeciality] = useState(existing?.speciality || "");
  const [bio, setBio] = useState(existing?.bio || "");
  const [winRate, setWinRate] = useState(existing?.winRate || "");
  const [totalSignals, setTotalSignals] = useState(existing?.totalSignals || "");
  const [experience, setExperience] = useState(existing?.experience || "");
  const [markets, setMarkets] = useState(existing?.markets?.join(", ") || "");
  const [order, setOrder] = useState(existing?.order?.toString() || "1");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name) { Alert.alert("Missing", "Name is required."); return; }
    setSaving(true);
    const payload = {
      name, role, speciality, bio, winRate,
      totalSignals, experience,
      markets: markets.split(",").map(m => m.trim()).filter(Boolean),
      order: parseInt(order) || 1,
      updatedAt: serverTimestamp()
    };
    try {
      if (isEdit) {
        await updateDoc(doc(db, "analysts", existing.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "analysts"), payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Field label="Full Name" value={name} onChangeText={setName} />
      <Field label="Role (e.g. Head Analyst)" value={role} onChangeText={setRole} />
      <Field label="Speciality (e.g. Gold & Forex)" value={speciality} onChangeText={setSpeciality} />
      <Field label="Bio" value={bio} onChangeText={setBio} multiline />
      <Field label="Win Rate (e.g. 78)" value={winRate} onChangeText={setWinRate} keyboardType="number-pad" />
      <Field label="Total Signals" value={totalSignals} onChangeText={setTotalSignals} keyboardType="number-pad" />
      <Field label="Experience (e.g. 5 years)" value={experience} onChangeText={setExperience} />
      <Field label="Markets (comma separated, e.g. Forex, Gold, Crypto)" value={markets} onChangeText={setMarkets} />
      <Field label="Display Order" value={order} onChangeText={setOrder} keyboardType="number-pad" />

      <TouchableOpacity onPress={save} disabled={saving} style={styles.saveBtn}>
        <LinearGradient colors={["#0A1A3D", "#0EA5E9"]} style={styles.saveBtnInner}>
          <Text style={styles.saveBtnText}>{saving ? "Saving..." : isEdit ? "Update Analyst" : "Add Analyst"}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field(props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={[styles.input, props.multiline && { height: 80, textAlignVertical: "top" }]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: fontSizes.sm, color: colors.textSecondary, marginBottom: 6, fontWeight: "600" },
  input: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: fontSizes.md, color: colors.text },
  saveBtn: { borderRadius: radius.md, overflow: "hidden", marginTop: spacing.md, marginBottom: spacing.xl },
  saveBtnInner: { paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSizes.md }
});