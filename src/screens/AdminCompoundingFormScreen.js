// src/screens/AdminCompoundingFormScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

export default function AdminCompoundingFormScreen({ route, navigation }) {
  const existing = route.params?.row;
  const isEdit = !!existing;

  const [order, setOrder] = useState(
    existing?.order?.toString() || route.params?.nextOrder?.toString() || "1"
  );
  const [startBalance, setStartBalance] = useState(
    existing?.startBalance?.toString() || route.params?.lastEnd?.toString() || ""
  );
  const [percent, setPercent] = useState(existing?.percent?.toString() || "");
  const [note, setNote] = useState(existing?.note || "");
  const [saving, setSaving] = useState(false);

  const start = parseFloat(startBalance) || 0;
  const pct = parseFloat(percent) || 0;
  const profit = (start * pct) / 100;
  const end = start + profit;

  const save = async () => {
    if (!startBalance || !percent) {
      Alert.alert("Missing fields", "Starting balance and % are required.");
      return;
    }
    setSaving(true);
    const payload = {
      order: parseInt(order, 10) || 1,
      startBalance: startBalance.trim(),
      percent: percent.trim(),
      endBalance: end.toFixed(2),
      note: note.trim(),
      updatedAt: serverTimestamp()
    };
    try {
      if (isEdit) {
        await updateDoc(doc(db, "compoundingRows", existing.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "compoundingRows"), payload);
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
      <Field label="Row #" value={order} onChangeText={setOrder} keyboardType="number-pad" />
      <Field label="Starting Balance" value={startBalance} onChangeText={setStartBalance} keyboardType="decimal-pad" />
      <Field label="Gain / Loss %" value={percent} onChangeText={setPercent} keyboardType="decimal-pad" placeholder="e.g. 5 or -2" />
      <Field label="Note (optional)" value={note} onChangeText={setNote} />

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Profit: <Text style={pct >= 0 ? styles.positive : styles.negative}>{profit.toFixed(2)}</Text></Text>
        <Text style={styles.previewLabel}>Ending Balance: <Text style={styles.previewValue}>{end.toFixed(2)}</Text></Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? "Saving..." : isEdit ? "Update Row" : "Add Row"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field(props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: fontSizes.sm, color: colors.textMuted, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: fontSizes.md,
    color: colors.text
  },
  previewCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  previewLabel: { fontSize: fontSizes.md, color: colors.text, marginBottom: 4 },
  previewValue: { fontWeight: "800", color: colors.primary },
  positive: { color: colors.success, fontWeight: "800" },
  negative: { color: colors.danger, fontWeight: "800" },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: spacing.xl
  },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.md }
});
