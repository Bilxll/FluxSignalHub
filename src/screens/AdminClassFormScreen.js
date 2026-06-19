import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet,
  ScrollView, TouchableOpacity, Alert, Switch
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { broadcastNotification } from "../utils/notifications";

export default function AdminClassFormScreen({ route, navigation }) {
  const existing = route.params?.classItem;
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [link, setLink] = useState(existing?.link || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [date, setDate] = useState(existing?.date || "");
  const [isLive, setIsLive] = useState(existing?.isLive || false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) {
      Alert.alert("Missing field", "Title is required.");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      notes: notes.trim(),
      date: date.trim(),
      isLive,
      updatedAt: serverTimestamp()
    };
    try {
      if (isEdit) {
        await updateDoc(doc(db, "classes", existing.id), payload);
        if (isLive && !existing.isLive) {
          await broadcastNotification({
            title: "🎓 FLUX Live Class Starting Now!",
            body: title.trim(),
            data: { type: "live_class" }
          });
        }
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, "classes"), payload);
        if (isLive) {
          await broadcastNotification({
            title: "🎓 FLUX Live Class Starting Now!",
            body: title.trim(),
            data: { type: "live_class" }
          });
        }
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
      <Field label="Class Title" value={title} onChangeText={setTitle} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />
      <Field label="Live/Recording Link (YouTube, Zoom, Google Meet)" value={link} onChangeText={setLink} placeholder="https://..." autoCapitalize="none" />
      <Field label="Notes & Materials" value={notes} onChangeText={setNotes} multiline placeholder="Paste notes, key levels, PDF links..." />
      <Field label="Date (e.g. June 18, 2026)" value={date} onChangeText={setDate} />

      <View style={styles.switchRow}>
        <View>
          <Text style={styles.label}>Mark as Live Now</Text>
          <Text style={styles.switchHint}>Sends a push notification to all users</Text>
        </View>
        <Switch
          value={isLive}
          onValueChange={setIsLive}
          trackColor={{ true: "#FF3B5C" }}
          thumbColor={colors.white}
        />
      </View>

      <TouchableOpacity onPress={save} disabled={saving} style={styles.saveBtn}>
        <LinearGradient colors={["#1A0A3D", "#7C3AED"]} style={styles.saveBtnInner}>
          <Text style={styles.saveBtnText}>
            {saving ? "Saving..." : isEdit ? "Update Class" : "Create Class"}
          </Text>
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
        style={[styles.input, props.multiline && { height: 90, textAlignVertical: "top" }]}
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
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  switchHint: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  saveBtn: { borderRadius: radius.md, overflow: "hidden", marginTop: spacing.md, marginBottom: spacing.xl },
  saveBtnInner: { paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSizes.md }
});