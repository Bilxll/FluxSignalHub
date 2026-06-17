import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardScreen() {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "challenges"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const trading = all.filter(c => c.type === "trading");
      const sorted = trading.sort((a, b) => {
        const aGain = ((parseFloat(a.currentBalance) - parseFloat(a.startBalance)) / (parseFloat(a.startBalance) || 1)) * 100;
        const bGain = ((parseFloat(b.currentBalance) - parseFloat(b.startBalance)) / (parseFloat(b.startBalance) || 1)) * 100;
        return bGain - aGain;
      });
      setChallenges(sorted);
    });
    return unsub;
  }, []);

  const renderItem = ({ item, index }) => {
    const start = parseFloat(item.startBalance) || 0;
    const current = parseFloat(item.currentBalance) || 0;
    const target = parseFloat(item.targetBalance) || 0;
    const gainPct = start > 0 ? ((current - start) / start) * 100 : 0;
    const progress = target > start ? Math.min(1, Math.max(0, (current - start) / (target - start))) : 0;
    const isTop3 = index < 3;

    return (
      <GlassCard style={[styles.row, isTop3 && styles.topRow]}>
        <View style={styles.rankBox}>
          {isTop3
            ? <Text style={styles.medal}>{MEDALS[index]}</Text>
            : <Text style={styles.rank}>#{index + 1}</Text>
          }
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={styles.progressBg}>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.balances}>
            {current.toLocaleString()} / {target.toLocaleString()}
          </Text>
        </View>
        <View style={styles.gainBox}>
          <Text style={[
            styles.gain,
            { color: gainPct >= 0 ? colors.success : colors.danger }
          ]}>
            {gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%
          </Text>
          <Text style={styles.gainLabel}>gain</Text>
        </View>
      </GlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#3D2E00", "#0A0A0F"]} style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Leaderboard</Text>
        <Text style={styles.headerSub}>Ranked by % gain from start balance</Text>
      </LinearGradient>

      <FlatList
        data={challenges}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <GlassCard>
            <Text style={styles.emptyText}>No challenges to rank yet.</Text>
          </GlassCard>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  headerTitle: { fontSize: fontSizes.xxl, fontWeight: "800", color: colors.white },
  headerSub: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  glassCard: { backgroundColor: colors.glass, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, padding: spacing.md, marginBottom: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  topRow: { borderColor: colors.accent + "44", backgroundColor: colors.accent + "11" },
  rankBox: { width: 36, alignItems: "center" },
  rank: { fontSize: fontSizes.md, fontWeight: "800", color: colors.textMuted },
  medal: { fontSize: 24 },
  info: { flex: 1 },
  title: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text, marginBottom: 6 },
  progressBg: { height: 4, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: radius.pill, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: 4, borderRadius: radius.pill },
  balances: { fontSize: fontSizes.xs, color: colors.textMuted },
  gainBox: { alignItems: "center" },
  gain: { fontSize: fontSizes.lg, fontWeight: "800" },
  gainLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  emptyText: { color: colors.textMuted, textAlign: "center" }
});