// src/screens/AdminChallengeFormScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { broadcastNotification } from "../utils/notifications";

export default function AdminChallengeFormScreen({ route, navigation }) {
  const existing = route.params?.challenge;
  const type = route.params?.type || existing?.type || "trading";
  const isEdit = !!existing;
  const isTrading = type === "trading";

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [rules, setRules] = useState(existing?.rules || "");
  const [status, setStatus] = useState(existing?.status || (isTrading ? "Active" : "Open"));

  // trading-specific
  const [startBalance, setStartBalance] = useState(existing?.startBalance?.toString() || "");
  const [currentBalance, setCurrentBalance] = useState(existing?.currentBalance?.toString() || "");
  const [targetBalance, setTargetBalance] = useState(existing?.targetBalance?.toString() || "");

  // giveaway-specific
  const [prize, setPrize] = useState(existing?.prize || "");
  const [endsAt, setEndsAt] = useState(existing?.endsAt || "");
  const [winner, setWinner] = useState(existing?.winner || "");

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      Alert.alert("Missing field", "Title is required.");
      return;
    }

    setSaving(true);
    const payload = {
      type,
      title: title.trim(),
      description: description.trim(),
      rules: rules.trim(),
      status,
      updatedAt: serverTimestamp()
    };

    if (isTrading) {
      payload.startBalance = startBalance.trim();
      payload.currentBalance = currentBalance.trim();
      payload.targetBalance = targetBalance.trim();
    } else {
      payload.prize = prize.trim();
      payload.endsAt = endsAt.trim();
      payload.winner = winner.trim();
    }

    try {
      if (isEdit) {
        await updateDoc(doc(db, "challenges", existing.id), payload);
        await broadcastNotification({
          title: `${isTrading ? "Challenge" : "Giveaway"} updated: ${payload.title}`,
          body: isTrading
            ? `Balance: ${payload.currentBalance} / Target: ${payload.targetBalance}`
            : payload.winner
              ? `Winner announced: ${payload.winner}`
              : `Status: ${payload.status}`,
          data: { type: "challenge_update", id: existing.id }
        });
      } else {
        payload.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, "challenges"), payload);
        await broadcastNotification({
          title: `New ${isTrading ? "Trading Challenge" : "Giveaway"}: ${payload.title}`,
          body: description || (isTrading ? "A new challenge has started!" : "A new giveaway is live!"),
          data: { type: "new_challenge", id: ref.id }
        });
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
      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />
      <Field label="Rules / Terms" value={rules} onChangeText={setRules} multiline />

      {isTrading ? (
        <>
          <Field label="Starting Balance" value={startBalance} onChangeText={setStartBalance} keyboardType="decimal-pad" />
          <Field label="Current Balance" value={currentBalance} onChangeText={setCurrentBalance} keyboardType="decimal-pad" />
          <Field label="Target Balance" value={targetBalance} onChangeText={setTargetBalance} keyboardType="decimal-pad" />
          <Text style={styles.label}>Status</Text>
          <StatusPills options={["Active", "Completed", "Failed"]} value={status} onChange={setStatus} />
        </>
      ) : (
        <>
          <Field label="Prize" value={prize} onChangeText={setPrize} />
          <Field label="Ends At (e.g. 30 June 2026)" value={endsAt} onChangeText={setEndsAt} />
          <Field label="Winner (leave blank until drawn)" value={winner} onChangeText={setWinner} />
          <Text style={styles.label}>Status</Text>
          <StatusPills options={["Open", "Completed"]} value={status} onChange={setStatus} />
        </>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? "Saving..." : isEdit ? "Update" : "Create"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatusPills({ options, value, onChange }) {
  return (
    <View style={styles.pillRow}>
      {options.map((s) => (
        <TouchableOpacity
          key={s}
          style={[styles.pill, value === s && { backgroundColor: colors.primary }]}
          onPress={() => onChange(s)}
        >
          <Text style={[styles.pillText, value === s && { color: colors.white }]}>{s}</Text>
        </TouchableOpacity>
      ))}
    </View>
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
  pillRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md, flexWrap: "wrap" },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  pillText: { color: colors.text, fontWeight: "600", fontSize: fontSizes.sm },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.xl
  },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.md }
});
