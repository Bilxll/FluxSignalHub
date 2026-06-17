import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection, onSnapshot, query,
  orderBy, deleteDoc, doc, addDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";

function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

export default function TradeHistoryScreen({ navigation }) {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "tradeHistory"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setTrades(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const wins = trades.filter(t => t.result === "WIN").length;
  const losses = trades.filter(t => t.result === "LOSS").length;
  const be = trades.filter(t => t.result === "BE").length;
  const winRate = trades.length > 0
    ? Math.round((wins / (wins + losses || 1)) * 100)
    : 0;
  const totalPips = trades.reduce((sum, t) => sum + (parseFloat(t.pips) || 0), 0);

  const handleDelete = (id) => {
    Alert.alert("Delete trade", "Remove this trade from history?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "tradeHistory", id)) }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Stats header */}
      <LinearGradient colors={["#0B3D1E", "#0A0A0F"]} style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trades.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>{wins}</Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.danger }]}>{losses}</Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: totalPips >= 0 ? colors.success : colors.danger }]}>
              {totalPips > 0 ? "+" : ""}{totalPips.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Pips</Text>
          </View>
        </View>

        {/* Win rate bar */}
        <View style={styles.winBar}>
          <View style={[styles.winFill, { width: `${winRate}%` }]} />
        </View>
      </LinearGradient>

      <FlatList
        data={trades}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <GlassCard style={styles.tradeCard}>
            <View style={styles.tradeTop}>
              <View style={styles.tradeLeft}>
                <Text style={styles.tradeAsset}>{item.asset}</Text>
                <View style={[
                  styles.dirBadge,
                  { backgroundColor: item.direction === "BUY" ? colors.buy + "22" : colors.sell + "22" }
                ]}>
                  <Text style={[
                    styles.dirText,
                    { color: item.direction === "BUY" ? colors.buy : colors.sell }
                  ]}>{item.direction}</Text>
                </View>
              </View>
              <View style={[
                styles.resultBadge,
                {
                  backgroundColor:
                    item.result === "WIN" ? colors.success + "22" :
                    item.result === "LOSS" ? colors.danger + "22" :
                    colors.warning + "22"
                }
              ]}>
                <Text style={[
                  styles.resultText,
                  {
                    color:
                      item.result === "WIN" ? colors.success :
                      item.result === "LOSS" ? colors.danger :
                      colors.warning
                  }
                ]}>
                  {item.result === "WIN" ? "✅ WIN" : item.result === "LOSS" ? "❌ LOSS" : "➡️ BE"}
                </Text>
              </View>
            </View>

            <View style={styles.tradeDetails}>
              <Detail label="Entry" value={item.entry} />
              <Detail label="Exit" value={item.exit} />
              <Detail
                label="Pips"
                value={`${parseFloat(item.pips) >= 0 ? "+" : ""}${item.pips}`}
                color={parseFloat(item.pips) >= 0 ? colors.success : colors.danger}
              />
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
            </View>

            {isAdmin && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        )}
        ListEmptyComponent={
          <GlassCard>
            <Text style={styles.emptyText}>
              {isAdmin ? "No trades logged yet. Tap + to add one." : "No trade history yet."}
            </Text>
          </GlassCard>
        }
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AdminTradeForm")}
        >
          <LinearGradient colors={["#0B3D1E", "#00C853"]} style={styles.fabGradient}>
            <Text style={styles.fabText}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Detail({ label, value, color }) {
  if (!value) return null;
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingTop: spacing.lg },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  statItem: { alignItems: "center" },
  statValue: { fontSize: fontSizes.xl, fontWeight: "800", color: colors.white },
  statLabel: { fontSize: fontSizes.xs, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  winBar: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: radius.pill, overflow: "hidden" },
  winFill: { height: 4, backgroundColor: colors.success },
  glassCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  tradeCard: { marginBottom: spacing.sm },
  tradeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  tradeLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  tradeAsset: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.text },
  dirBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  dirText: { fontSize: fontSizes.xs, fontWeight: "800" },
  resultBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  resultText: { fontSize: fontSizes.xs, fontWeight: "800" },
  tradeDetails: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  detail: {},
  detailLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  detailValue: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.text },
  notes: { fontSize: fontSizes.xs, color: colors.textMuted, fontStyle: "italic", marginTop: spacing.xs },
  deleteBtn: { marginTop: spacing.sm, alignSelf: "flex-end" },
  deleteBtnText: { color: colors.danger, fontSize: fontSizes.xs, fontWeight: "700" },
  emptyText: { color: colors.textMuted, textAlign: "center" },
  fab: { position: "absolute", right: spacing.lg, bottom: spacing.lg, borderRadius: radius.pill, overflow: "hidden" },
  fabGradient: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  fabText: { color: colors.white, fontSize: 32, lineHeight: 34 }
});