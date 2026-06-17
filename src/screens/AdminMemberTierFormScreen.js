import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, TouchableOpacity, Alert, Switch
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

export default function AdminMemberTierFormScreen({ route, navigation }) {
  const existing = route.params?.tier;
  const isEdit = !!existing;

  const [name, setName] = useState(existing?.name || "Basic");
  const [price, setPrice] = useState(existing?.price || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [features, setFeatures] = useState(existing?.features?.join("\n") || "");
  const [contactLink, setContactLink] = useState(existing?.contactLink || "");
  const [order, setOrder] = useState(existing?.order?.toString() || "1");
  const [popular, setPopular] = useState(existing?.popular || false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name || !price) {
      Alert.alert("Missing fields", "Name and price are required.");
      return;
    }
    setSaving(true);
    const payload = {
      name,
      price,
      description,
      features: features.split("\n").filter(f => f.trim()),
      contactLink,
      order: parseInt(order) || 1,
      popular,
      updatedAt: serverTimestamp()
    };
    try {
      if (isEdit) {
        await updateDoc(doc(db, "memberTiers", existing.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "memberTiers"), payload);
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
      <Text style={styles.label}>Tier Name</Text>
      <View style={styles.pillRow}>
        {["Basic", "Pro", "VIP"].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.pill, name === t && { backgroundColor: colors.primary }]}
            onPress={() => setName(t)}
          >
            <Text style={[styles.pillText, name === t && { color: colors.white }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Price (e.g. $49/month)" value={price} onChangeText={setPrice} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />
      <Field
        label="Features (one per line)"
        value={features}
        onChangeText={setFeatures}
        multiline
        placeholder={"Daily signals\nVIP group access\n1-on-1 mentoring"}
      />
      <Field label="Contact / How to join (e.g. WhatsApp link)" value={contactLink} onChangeText={setContactLink} />
      <Field label="Display order (1 = first)" value={order} onChangeText={setOrder} keyboardType="number-pad" />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Mark as Popular</Text>
        <Switch
          value={popular}
          onValueChange={setPopular}
          trackColor={{ true: colors.primary }}
          thumbColor={colors.white}
        />
      </View>

      <TouchableOpacity onPress={save} disabled={saving} style={styles.saveBtn}>
        <LinearGradient colors={["#0B3D1E", "#00C853"]} style={styles.saveBtnInner}>
          <Text style={styles.saveBtnText}>{saving ? "Saving..." : isEdit ? "Update Tier" : "Create Tier"}</Text>
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
        style={[styles.input, props.multiline && { height: 100, textAlignVertical: "top" }]}
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
  pillRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  pill: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.glassBorder },
  pillText: { color: colors.textSecondary, fontWeight: "700", fontSize: fontSizes.sm },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  saveBtn: { borderRadius: radius.md, overflow: "hidden", marginTop: spacing.md, marginBottom: spacing.xl },
  saveBtnInner: { paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSizes.md }
});