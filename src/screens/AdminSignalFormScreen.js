// src/screens/AdminSignalFormScreen.js
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

const DIRECTIONS = ["BUY", "SELL"];
const STATUSES = ["Active", "TP Hit", "SL Hit", "BE Hit", "Closed"];

export default function AdminSignalFormScreen({ route, navigation }) {
  const existing = route.params?.signal;
  const isEdit = !!existing;

  const [asset, setAsset] = useState(existing?.asset || "");
  const [direction, setDirection] = useState(existing?.direction || "BUY");
  const [entry, setEntry] = useState(existing?.entry?.toString() || "");
  const [tp, setTp] = useState(existing?.tp?.toString() || "");
  const [sl, setSl] = useState(existing?.sl?.toString() || "");
  const [be, setBe] = useState(existing?.be?.toString() || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [status, setStatus] = useState(existing?.status || "Active");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!asset.trim() || !entry || !tp || !sl) {
      Alert.alert("Missing fields", "Asset, Entry, TP and SL are required.");
      return;
    }

    setSaving(true);
    const payload = {
      asset: asset.trim().toUpperCase(),
      direction,
      entry: entry.trim(),
      tp: tp.trim(),
      sl: sl.trim(),
      be: be.trim(),
      notes: notes.trim(),
      status,
      updatedAt: serverTimestamp()
    };

    try {
      if (isEdit) {
        await updateDoc(doc(db, "signals", existing.id), payload);
        await broadcastNotification({
          title: `${payload.asset} signal updated`,
          body: `Status: ${status}${notes ? " — " + notes : ""}`,
          data: { type: "signal_update", id: existing.id }
        });
      } else {
        payload.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, "signals"), payload);
        await broadcastNotification({
          title: `New ${payload.direction} signal: ${payload.asset}`,
          body: `Entry: ${payload.entry} | TP: ${payload.tp} | SL: ${payload.sl}`,
          data: { type: "new_signal", id: ref.id }
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
      <Field label="Asset (e.g. XAUUSD, EURUSD, BTCUSD)" value={asset} onChangeText={setAsset} autoCapitalize="characters" />

      <Text style={styles.label}>Direction</Text>
      <View style={styles.pillRow}>
        {DIRECTIONS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              styles.pill,
              direction === d && {
                backgroundColor: d === "BUY" ? colors.buy : colors.sell
              }
            ]}
            onPress={() => setDirection(d)}
          >
            <Text style={[styles.pillText, direction === d && { color: colors.white }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Entry Price" value={entry} onChangeText={setEntry} keyboardType="decimal-pad" />
      <Field label="Take Profit (TP)" value={tp} onChangeText={setTp} keyboardType="decimal-pad" />
      <Field label="Stop Loss (SL)" value={sl} onChangeText={setSl} keyboardType="decimal-pad" />
      <Field label="Break Even (BE) - optional" value={be} onChangeText={setBe} keyboardType="decimal-pad" />
      <Field label="Notes" value={notes} onChangeText={setNotes} multiline />

      {isEdit && (
        <>
          <Text style={styles.label}>Status</Text>
          <View style={styles.pillRow}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.pill, status === s && { backgroundColor: colors.primary }]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.pillText, status === s && { color: colors.white }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        <Text style={styles.saveBtnText}>
          {saving ? "Saving..." : isEdit ? "Update Signal" : "Post Signal"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field(props) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={[styles.input, props.multiline && { height: 90, textAlignVertical: "top" }]}
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
