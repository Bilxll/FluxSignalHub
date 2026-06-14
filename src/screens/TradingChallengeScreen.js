// src/screens/TradingChallengeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  deleteDoc,
  doc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";

export default function TradingChallengeScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "challenges"),
      where("type", "==", "trading"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleDelete = (id, title) => {
    Alert.alert("Delete challenge", `Remove "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "challenges", id)) }
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => {
          const start = parseFloat(item.startBalance) || 0;
          const current = parseFloat(item.currentBalance) || 0;
          const target = parseFloat(item.targetBalance) || 0;
          const progress = target > start ? Math.min(1, Math.max(0, (current - start) / (target - start))) : 0;

          return (
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === "Completed" ? colors.success : item.status === "Failed" ? colors.danger : colors.info }]}>
                  <Text style={styles.statusText}>{item.status || "Active"}</Text>
                </View>
              </View>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}

              <View style={styles.balancesRow}>
                <Stat label="Start" value={item.startBalance} />
                <Stat label="Current" value={item.currentBalance} highlight />
                <Stat label="Target" value={item.targetBalance} />
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
              </View>

              {item.rules ? <Text style={styles.rules}>{item.rules}</Text> : null}

              {isAdmin && (
                <View style={styles.adminRow}>
                  <TouchableOpacity
                    style={[styles.adminBtn, { backgroundColor: colors.primary }]}
                    onPress={() => navigation.navigate("AdminChallengeForm", { challenge: item, type: "trading" })}
                  >
                    <Text style={styles.adminBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.adminBtn, { backgroundColor: colors.danger }]}
                    onPress={() => handleDelete(item.id, item.title)}
                  >
                    <Text style={styles.adminBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isAdmin ? "No challenges yet. Tap + to create one." : "No active trading challenges right now."}
            </Text>
          </View>
        }
      />
      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AdminChallengeForm", { type: "trading" })}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && { color: colors.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.primary, flex: 1 },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  statusText: { color: colors.white, fontSize: fontSizes.xs, fontWeight: "700" },
  desc: { color: colors.textMuted, marginTop: 4, fontSize: fontSizes.sm },
  balancesRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.md },
  stat: { alignItems: "center" },
  statLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  statValue: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    overflow: "hidden"
  },
  progressBarFill: { height: 8, backgroundColor: colors.accent },
  rules: { marginTop: spacing.sm, color: colors.textMuted, fontSize: fontSizes.sm, fontStyle: "italic" },
  adminRow: { flexDirection: "row", marginTop: spacing.sm, gap: spacing.sm },
  adminBtn: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  adminBtnText: { color: colors.white, fontWeight: "600", fontSize: fontSizes.sm },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.textMuted, fontSize: fontSizes.md, textAlign: "center" },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4
  },
  fabText: { color: colors.white, fontSize: 32, lineHeight: 34 }
});
