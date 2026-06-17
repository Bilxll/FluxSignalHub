import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection, onSnapshot, query,
  orderBy, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";

function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

export default function AnalystsScreen({ navigation }) {
  const [analysts, setAnalysts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "analysts"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, snap => {
      setAnalysts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleDelete = (id, name) => {
    Alert.alert("Delete analyst", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "analysts", id)) }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1A3D", "#0A0A0F"]} style={styles.header}>
        <Text style={styles.headerTitle}>Our Analysts</Text>
        <Text style={styles.headerSub}>Meet the team behind the signals</Text>
      </LinearGradient>

      <FlatList
        data={analysts}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <GlassCard style={styles.analystCard}>
            <View style={styles.analystTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name?.charAt(0)?.toUpperCase() || "A"}
                </Text>
              </View>
              <View style={styles.analystInfo}>
                <Text style={styles.analystName}>{item.name}</Text>
                <Text style={styles.analystRole}>{item.role}</Text>
                {item.speciality ? (
                  <View style={styles.specialityBadge}>
                    <Text style={styles.specialityText}>{item.speciality}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {item.bio ? <Text style={styles.bio}>{item.bio}</Text> : null}

            <View style={styles.statsRow}>
              {item.winRate ? (
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.success }]}>{item.winRate}%</Text>
                  <Text style={styles.statLabel}>Win Rate</Text>
                </View>
              ) : null}
              {item.totalSignals ? (
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{item.totalSignals}</Text>
                  <Text style={styles.statLabel}>Signals</Text>
                </View>
              ) : null}
              {item.experience ? (
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.accent }]}>{item.experience}</Text>
                  <Text style={styles.statLabel}>Experience</Text>
                </View>
              ) : null}
            </View>

            {item.markets ? (
              <View style={styles.marketsRow}>
                {item.markets.map((m, i) => (
                  <View key={i} style={styles.marketBadge}>
                    <Text style={styles.marketText}>{m}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {isAdmin && (
              <View style={styles.adminRow}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate("AdminAnalystForm", { analyst: item })}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id, item.name)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        )}
        ListEmptyComponent={
          <GlassCard>
            <Text style={styles.emptyText}>
              {isAdmin ? "No analysts yet. Tap + to add one." : "Analyst profiles coming soon."}
            </Text>
          </GlassCard>
        }
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AdminAnalystForm")}
        >
          <LinearGradient colors={["#0A1A3D", "#0EA5E9"]} style={styles.fabGradient}>
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  headerTitle: { fontSize: fontSizes.xxl, fontWeight: "800", color: colors.white },
  headerSub: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  glassCard: { backgroundColor: colors.glass, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, padding: spacing.md, marginBottom: spacing.sm },
  analystCard: { marginBottom: spacing.md },
  analystTop: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.md },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary + "33", borderWidth: 2, borderColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: fontSizes.xl, fontWeight: "800", color: colors.primary },
  analystInfo: { flex: 1, justifyContent: "center" },
  analystName: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.text },
  analystRole: { fontSize: fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  specialityBadge: { backgroundColor: colors.info + "22", paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: "flex-start", marginTop: 4 },
  specialityText: { color: colors.info, fontSize: fontSizes.xs, fontWeight: "700" },
  bio: { color: colors.textSecondary, fontSize: fontSizes.sm, marginBottom: spacing.md, lineHeight: 20 },
  statsRow: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.sm },
  statItem: { alignItems: "center" },
  statValue: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.text },
  statLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  marketsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.sm },
  marketBadge: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  marketText: { color: colors.textSecondary, fontSize: fontSizes.xs, fontWeight: "600" },
  adminRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  editBtn: { backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  editBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.sm },
  deleteBtn: { backgroundColor: colors.danger + "22", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  deleteBtnText: { color: colors.danger, fontWeight: "700", fontSize: fontSizes.sm },
  emptyText: { color: colors.textMuted, textAlign: "center" },
  fab: { position: "absolute", right: spacing.lg, bottom: spacing.lg, borderRadius: radius.pill, overflow: "hidden" },
  fabGradient: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  fabText: { color: colors.white, fontSize: 32, lineHeight: 34 }
});