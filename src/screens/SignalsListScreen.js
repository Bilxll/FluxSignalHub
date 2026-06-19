import React, { useEffect, useState } from "react";
import {
  View, FlatList, Text, StyleSheet,
  TouchableOpacity, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";

const FILTERS = ["All", "Active", "TP Hit", "SL Hit", "BE Hit", "Closed"];

export default function SignalsListScreen({ navigation }) {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "signals"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setSignals(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const filtered = filter === "All" ? signals : signals.filter(s => s.status === filter);

  const handleDelete = (id, asset) => {
    Alert.alert("Delete signal", `Remove the ${asset} signal?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "signals", id)) }
    ]);
  };

  return (
    <LinearGradient colors={colors.gradSignals} style={styles.root} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>{isAdmin ? "Manage Signals" : "Signals"}</Text>
        <FlatList
          data={FILTERS}
          keyExtractor={i => i}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              style={[styles.filterPill, filter === item && styles.filterPillActive]}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("SignalDetail", { signal: item })}
            activeOpacity={0.8}
          >
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.left}>
                  <View style={[styles.dirIcon, { backgroundColor: item.direction === "BUY" ? colors.success + "15" : colors.danger + "15", borderColor: item.direction === "BUY" ? colors.success + "30" : colors.danger + "30" }]}>
                    <Text style={[styles.dirArrow, { color: item.direction === "BUY" ? colors.success : colors.danger }]}>{item.direction === "BUY" ? "↑" : "↓"}</Text>
                  </View>
                  <View>
                    <Text style={styles.asset}>{item.asset}</Text>
                    <Text style={styles.dir}>{item.direction}</Text>
                  </View>
                </View>
                <View style={[styles.statusPill, { backgroundColor: item.status === "TP Hit" ? colors.success + "15" : item.status === "SL Hit" ? colors.danger + "15" : item.status === "Active" ? colors.info + "15" : "rgba(255,255,255,0.07)", borderColor: item.status === "TP Hit" ? colors.success + "30" : item.status === "SL Hit" ? colors.danger + "30" : item.status === "Active" ? colors.info + "30" : "rgba(255,255,255,0.1)" }]}>
                  <Text style={[styles.statusText, { color: item.status === "TP Hit" ? colors.success : item.status === "SL Hit" ? colors.danger : item.status === "Active" ? colors.info : colors.textMuted }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.grid}>
                <Cell label="ENTRY" value={item.entry} />
                <Cell label="TP" value={item.tp} color={colors.success} bg={colors.success + "10"} />
                <Cell label="SL" value={item.sl} color={colors.danger} bg={colors.danger + "10"} />
                {item.be ? <Cell label="BE" value={item.be} color={colors.warning} bg={colors.warning + "10"} /> : null}
              </View>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
              {isAdmin && (
                <View style={styles.adminRow}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate("AdminSignalForm", { signal: item })}>
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id, item.asset)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{isAdmin ? "No signals yet. Tap + to post one." : "No signals right now."}</Text>
          </View>
        }
      />

      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AdminSignalForm")}>
          <LinearGradient colors={["#0B3D1E", colors.primary]} style={styles.fabGrad}>
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

function Cell({ label, value, color, bg }) {
  if (!value) return null;
  return (
    <View style={[styles.cell, bg && { backgroundColor: bg }]}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, color && { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingTop: 56, paddingBottom: spacing.md },
  title: { fontSize: fontSizes.xxl, fontWeight: "800", color: colors.text },
  filterPill: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 },
  filterPillActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primaryBorder },
  filterText: { fontSize: fontSizes.xs, color: colors.textMuted, fontWeight: "600" },
  filterTextActive: { color: colors.primary },
  card: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  left: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dirIcon: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dirArrow: { fontSize: 16, fontWeight: "800" },
  asset: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  dir: { fontSize: fontSizes.xs, color: colors.textMuted },
  statusPill: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 9, fontWeight: "700" },
  grid: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  cell: { flex: 1, minWidth: 60, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: radius.sm, padding: 8, alignItems: "center" },
  cellLabel: { fontSize: 8, color: colors.textMuted, marginBottom: 2 },
  cellValue: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.text },
  notes: { fontSize: fontSizes.xs, color: colors.textMuted, fontStyle: "italic", marginTop: spacing.sm },
  adminRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  editBtn: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  editBtnText: { color: colors.text, fontWeight: "600", fontSize: fontSizes.xs },
  deleteBtn: { backgroundColor: colors.redGlow, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  deleteBtnText: { color: colors.danger, fontWeight: "600", fontSize: fontSizes.xs },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.textMuted, textAlign: "center" },
  fab: { position: "absolute", right: spacing.lg, bottom: 100, borderRadius: radius.pill, overflow: "hidden" },
  fabGrad: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  fabText: { color: colors.white, fontSize: 32, lineHeight: 34 }
});