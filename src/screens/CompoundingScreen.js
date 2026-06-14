import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from "react-native";
import Svg, { Polyline } from "react-native-svg";
import {
  collection, onSnapshot, query,
  orderBy, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";

export default function CompoundingScreen({ navigation }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "compoundingRows"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleDelete = (id, label) => {
    Alert.alert("Delete row", `Remove "${label}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "compoundingRows", id)) }
    ]);
  };

  const renderChart = () => {
    if (rows.length < 2) return null;
    const values = rows.map(r => parseFloat(r.endBalance) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const points = values.map((v, i) =>
      `${(i / (values.length - 1)) * 280 + 10},${90 - ((v - min) / range) * 80}`
    ).join(" ");
    return (
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Balance Growth</Text>
        <Svg width="100%" height={110} viewBox="0 0 300 100">
          <Polyline points={points} fill="none" stroke={colors.primary} strokeWidth="2.5" />
        </Svg>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderChart()}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>#</Text>
          <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Start</Text>
          <Text style={[styles.cell, styles.headerCell, { flex: 0.8 }]}>%</Text>
          <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Profit</Text>
          <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>End</Text>
          {isAdmin && <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}> </Text>}
        </View>
        {rows.map((r) => {
          const start = parseFloat(r.startBalance) || 0;
          const percent = parseFloat(r.percent) || 0;
          const profit = (start * percent) / 100;
          const end = start + profit;
          return (
            <TouchableOpacity
              key={r.id}
              style={styles.tableRow}
              onLongPress={() => isAdmin && navigation.navigate("AdminCompoundingForm", { row: r })}
              activeOpacity={0.7}
            >
              <Text style={[styles.cell, { flex: 0.6 }]}>{r.order}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{start.toFixed(2)}</Text>
              <Text style={[styles.cell, { flex: 0.8 }, percent >= 0 ? styles.positive : styles.negative]}>
                {percent}%
              </Text>
              <Text style={[styles.cell, { flex: 1 }, profit >= 0 ? styles.positive : styles.negative]}>
                {profit.toFixed(2)}
              </Text>
              <Text style={[styles.cell, { flex: 1, fontWeight: "800" }]}>{end.toFixed(2)}</Text>
              {isAdmin && (
                <TouchableOpacity style={{ flex: 0.6 }} onPress={() => handleDelete(r.id, `#${r.order}`)}>
                  <Text style={{ color: colors.danger, textAlign: "center" }}>✕</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
        {rows.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isAdmin ? "No rows yet. Tap + to add the first compounding entry." : "Compounding plan coming soon."}
            </Text>
          </View>
        )}
      </View>
      {isAdmin && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AdminCompoundingForm", {
            nextOrder: rows.length + 1,
            lastEnd: rows.length ? (parseFloat(rows[rows.length - 1].startBalance) * (1 + parseFloat(rows[rows.length - 1].percent) / 100)).toFixed(2) : ""
          })}
        >
          <Text style={styles.addBtnText}>+ Add Row</Text>
        </TouchableOpacity>
      )}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  chartCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  chartTitle: { fontWeight: "800", color: colors.primary, fontSize: fontSizes.md, marginBottom: spacing.sm },
  tableCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  tableHeader: { flexDirection: "row", backgroundColor: colors.primary, padding: spacing.sm },
  headerCell: { color: colors.white, fontWeight: "800", fontSize: fontSizes.xs },
  tableRow: {
    flexDirection: "row",
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center"
  },
  cell: { fontSize: fontSizes.sm, color: colors.text, textAlign: "center" },
  positive: { color: colors.success, fontWeight: "700" },
  negative: { color: colors.danger, fontWeight: "700" },
  empty: { padding: spacing.lg, alignItems: "center" },
  emptyText: { color: colors.textMuted, textAlign: "center" },
  addBtn: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center"
  },
  addBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.md }
});