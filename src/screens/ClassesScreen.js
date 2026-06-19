import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Linking
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection, onSnapshot, query,
  orderBy, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";

export default function ClassesScreen({ navigation }) {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "classes"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const liveClasses = classes.filter(c => c.isLive);
  const pastClasses = classes.filter(c => !c.isLive);

  const handleDelete = (id, title) => {
    Alert.alert("Delete class", `Remove "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "classes", id)) }
    ]);
  };

  const joinClass = (link) => {
    if (!link) return Alert.alert("No link", "The admin hasn't added a link yet.");
    Linking.openURL(link).catch(() => Alert.alert("Error", "Could not open the link."));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <LinearGradient colors={["#1A0A3D", "#0A0A0F"]} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Classes</Text>
            <Text style={styles.headerSub}>Live sessions & recordings</Text>
          </View>
          {liveClasses.length > 0 && (
            <View style={styles.liveNowBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveNowText}>LIVE NOW</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Live classes */}
        {liveClasses.map(c => (
          <View key={c.id} style={styles.liveCard}>
            <View style={styles.liveTopRow}>
              <View style={styles.livePulse} />
              <Text style={styles.liveTag}>LIVE NOW</Text>
              <Text style={styles.liveTime}>
                {c.startedAt ? `Started ${c.startedAt}` : "In progress"}
              </Text>
            </View>
            <Text style={styles.classTitle}>{c.title}</Text>
            <Text style={styles.classDesc}>{c.description}</Text>
            {c.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Class Notes</Text>
                <Text style={styles.notesText}>{c.notes}</Text>
              </View>
            ) : null}
            <TouchableOpacity onPress={() => joinClass(c.link)}>
              <LinearGradient colors={["#FF3B5C", "#FF6B6B"]} style={styles.joinBtn}>
                <Text style={styles.joinBtnText}>🎥 Join Live Class</Text>
              </LinearGradient>
            </TouchableOpacity>
            {isAdmin && (
              <View style={styles.adminRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("AdminClassForm", { classItem: c })}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(c.id, c.title)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Past classes */}
        {pastClasses.length > 0 && (
          <Text style={styles.sectionLabel}>PAST CLASSES</Text>
        )}
        {pastClasses.map(c => (
          <View key={c.id} style={styles.pastCard}>
            <View style={styles.pastTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.classTitle}>{c.title}</Text>
                <Text style={styles.classDate}>{c.date}</Text>
              </View>
              <View style={styles.recordedBadge}>
                <Text style={styles.recordedText}>Recorded</Text>
              </View>
            </View>
            <Text style={styles.classDesc}>{c.description}</Text>
            {c.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>📄 Notes & Materials</Text>
                <Text style={styles.notesText}>{c.notes}</Text>
              </View>
            ) : null}
            {c.link ? (
              <TouchableOpacity style={styles.watchBtn} onPress={() => joinClass(c.link)}>
                <Text style={styles.watchBtnText}>▶ Watch Recording</Text>
              </TouchableOpacity>
            ) : null}
            {isAdmin && (
              <View style={styles.adminRow}>
                <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("AdminClassForm", { classItem: c })}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(c.id, c.title)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {classes.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isAdmin ? "No classes yet. Tap + to create one." : "No classes scheduled yet. Check back soon!"}
            </Text>
          </View>
        )}
      </View>

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AdminClassForm")}>
          <LinearGradient colors={["#1A0A3D", "#7C3AED"]} style={styles.fabGradient}>
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.lg },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: fontSizes.xxl, fontWeight: "800", color: colors.white },
  headerSub: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.4)", marginTop: 4 },
  liveNowBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,59,92,0.15)", borderWidth: 1, borderColor: "rgba(255,59,92,0.3)", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FF3B5C" },
  liveNowText: { fontSize: fontSizes.xs, color: "#FF3B5C", fontWeight: "700" },
  content: { padding: spacing.md },
  liveCard: { backgroundColor: "rgba(255,59,92,0.06)", borderWidth: 1, borderColor: "rgba(255,59,92,0.2)", borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  liveTopRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  livePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B5C" },
  liveTag: { fontSize: fontSizes.xs, color: "#FF3B5C", fontWeight: "700", letterSpacing: 1 },
  liveTime: { fontSize: fontSizes.xs, color: "rgba(255,255,255,0.3)", marginLeft: "auto" },
  classTitle: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.white, marginBottom: 4 },
  classDesc: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.5)", lineHeight: 20, marginBottom: spacing.md },
  classDate: { fontSize: fontSizes.xs, color: "rgba(255,255,255,0.35)", marginTop: 2, marginBottom: spacing.sm },
  notesBox: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md },
  notesLabel: { fontSize: fontSizes.xs, color: colors.textMuted, fontWeight: "700", marginBottom: 6 },
  notesText: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.7)", lineHeight: 20 },
  joinBtn: { borderRadius: radius.md, paddingVertical: 13, alignItems: "center" },
  joinBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSizes.md },
  pastCard: { backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  pastTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.sm },
  recordedBadge: { backgroundColor: "rgba(255,255,255,0.07)", borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  recordedText: { fontSize: fontSizes.xs, color: "rgba(255,255,255,0.4)" },
  watchBtn: { backgroundColor: "rgba(0,200,83,0.08)", borderWidth: 1, borderColor: "rgba(0,200,83,0.15)", borderRadius: radius.sm, paddingVertical: 10, alignItems: "center" },
  watchBtnText: { color: colors.primary, fontWeight: "700", fontSize: fontSizes.sm },
  sectionLabel: { fontSize: fontSizes.xs, color: "rgba(255,255,255,0.3)", letterSpacing: 1.5, marginBottom: spacing.sm, marginTop: spacing.xs },
  adminRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  editBtn: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  editBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.sm },
  deleteBtn: { backgroundColor: "rgba(255,59,92,0.12)", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  deleteBtnText: { color: "#FF3B5C", fontWeight: "700", fontSize: fontSizes.sm },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.textMuted, textAlign: "center", fontSize: fontSizes.sm },
  fab: { position: "absolute", right: spacing.lg, bottom: spacing.lg, borderRadius: radius.pill, overflow: "hidden" },
  fabGradient: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  fabText: { color: colors.white, fontSize: 32, lineHeight: 34 }
});