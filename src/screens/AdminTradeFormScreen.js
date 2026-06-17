import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, TouchableOpacity, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { broadcastNotification } from "../utils/notifications";

export default function AdminTradeFormScreen({ navigation }) {
  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState("BUY");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [pips, setPips] = useState("");
  const [result, setResult] = useState("WIN");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!asset || !entry || !exit) {
      Alert.alert("Missing fields", "Asset, Entry and Exit are required.");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "tradeHistory"), {
        asset: asset.toUpperCase(),
        direction, entry, exit, pips, result, notes,
        createdAt: serverTimestamp()
      });
      await broadcastNotification({
        title: `Trade result: ${result} on ${asset.toUpperCase()}`,
        body: `${direction} ${asset.toUpperCase()} — ${pips} pips`,
        data: { type: "trade_result" }
      });
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Field label="Asset" value={asset} onChangeText={setAsset} autoCapitalize="characters" />

      <Text style={styles.label}>Direction</Text>
      <View style={styles.pillRow}>
        {["BUY", "SELL"].map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.pill, direction === d && { backgroundColor: d === "BUY" ? colors.buy : colors.sell }]}
            onPress={() => setDirection(d)}
          >
            <Text style={[styles.pillText, direction === d && { color: colors.white }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Entry Price" value={entry} onChangeText={setEntry} keyboardType="decimal-pad" />
      <Field label="Exit Price" value={exit} onChangeText={setExit} keyboardType="decimal-pad" />
      <Field label="Pips (use - for loss)" value={pips} onChangeText={setPips} keyboardType="decimal-pad" />

      <Text style={styles.label}>Result</Text>
      <View style={styles.pillRow}>
        {["WIN", "LOSS", "BE"].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.pill, result === r && {
              backgroundColor: r === "WIN" ? colors.success : r === "LOSS" ? colors.danger : colors.warning
            }]}
            onPress={() => setResult(r)}
          >
            <Text style={[styles.pillText, result === r && { color: colors.white }]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Notes" value={notes} onChangeText={setNotes} multiline />

      <TouchableOpacity onPress={save} disabled={saving} style={styles.saveBtn}>
        <LinearGradient colors={["#0B3D1E", "#00C853"]} style={styles.saveBtnInner}>
          <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Log Trade"}</Text>
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
  input: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: fontSizes.md,
    color: colors.text
  },
  pillRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glassBorder
  },
  pillText: { color: colors.textSecondary, fontWeight: "700", fontSize: fontSizes.sm },
  saveBtn: { borderRadius: radius.md, overflow: "hidden", marginTop: spacing.md, marginBottom: spacing.xl },
  saveBtnInner: { paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSizes.md }
});