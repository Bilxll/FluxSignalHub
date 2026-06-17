import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";

function GlassCard({ children, style }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <GlassCard style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: color || colors.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassCard>
  );
}

export default function HomeScreen({ navigation }) {
  const [signals, setSignals] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "signals"), orderBy("createdAt", "desc"), limit(5));
    const unsub = onSnapshot(q, snap => {
      setSignals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "challenges"), orderBy("createdAt", "desc"), limit(3));
    const unsub = onSnapshot(q, snap => {
      setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const activeSignals = signals.filter(s => s.status === "Active").length;
  const tpHits = signals.filter(s => s.status === "TP Hit").length;
  const slHits = signals.filter(s => s.status === "SL Hit").length;
  const winRate = signals.length > 0
    ? Math.round((tpHits / (tpHits + slHits || 1)) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.primary} />}
    >
      {/* Header */}
      <LinearGradient
        colors={["#0B3D1E", "#0A0A0F"]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {isAdmin ? "👋 Welcome back, Admin" : "👋 FLUX Traders"}
            </Text>
            <Text style={styles.headerSub}>Your trading dashboard</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard label="Active" value={activeSignals} icon="📡" color={colors.info} />
          <StatCard label="Win Rate" value={`${winRate}%`} icon="🎯" color={colors.success} />
          <StatCard label="TP Hits" value={tpHits} icon="✅" color={colors.success} />
          <StatCard label="SL Hits" value={slHits} icon="❌" color={colors.danger} />
        </View>

        {/* Recent Signals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Signals</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signals")}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {signals.slice(0, 3).map(signal => (
            <TouchableOpacity
              key={signal.id}
              onPress={() => navigation.navigate("SignalDetail", { signal })}
            >
              <GlassCard style={styles.signalCard}>
                <View style={styles.signalLeft}>
                  <Text style={styles.signalAsset}>{signal.asset}</Text>
                  <View style={[
                    styles.dirBadge,
                    { backgroundColor: signal.direction === "BUY" ? colors.buy + "22" : colors.sell + "22" }
                  ]}>
                    <Text style={[
                      styles.dirText,
                      { color: signal.direction === "BUY" ? colors.buy : colors.sell }
                    ]}>{signal.direction}</Text>
                  </View>
                </View>
                <View style={styles.signalMid}>
                  <Text style={styles.signalMeta}>Entry: <Text style={styles.signalVal}>{signal.entry}</Text></Text>
                  <Text style={styles.signalMeta}>TP: <Text style={{ color: colors.success, fontWeight: "700" }}>{signal.tp}</Text></Text>
                </View>
                <View style={[
                  styles.statusPill,
                  { backgroundColor: signal.status === "TP Hit" ? colors.success + "22" :
                    signal.status === "SL Hit" ? colors.danger + "22" : colors.info + "22" }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: signal.status === "TP Hit" ? colors.success :
                      signal.status === "SL Hit" ? colors.danger : colors.info }
                  ]}>{signal.status}</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}

          {signals.length === 0 && (
            <GlassCard>
              <Text style={styles.emptyText}>No signals yet</Text>
            </GlassCard>
          )}
        </View>

        {/* Active Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Challenges</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Challenges")}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {challenges.slice(0, 2).map(c => {
            const start = parseFloat(c.startBalance) || 0;
            const current = parseFloat(c.currentBalance) || 0;
            const target = parseFloat(c.targetBalance) || 0;
            const progress = target > start
              ? Math.min(1, Math.max(0, (current - start) / (target - start)))
              : 0;
            return (
              <GlassCard key={c.id} style={{ marginBottom: spacing.sm }}>
                <Text style={styles.challengeTitle}>{c.title}</Text>
                <View style={styles.challengeRow}>
                  <Text style={styles.signalMeta}>
                    Current: <Text style={{ color: colors.primary, fontWeight: "700" }}>{c.currentBalance}</Text>
                  </Text>
                  <Text style={styles.signalMeta}>
                    Target: <Text style={{ color: colors.accent, fontWeight: "700" }}>{c.targetBalance}</Text>
                  </Text>
                </View>
                <View style={styles.progressBg}>
                  <LinearGradient
                    colors={[colors.primary, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress * 100}%` }]}
                  />
                </View>
                <Text style={styles.progressPct}>{Math.round(progress * 100)}% complete</Text>
              </GlassCard>
            );
          })}

          {challenges.length === 0 && (
            <GlassCard>
              <Text style={styles.emptyText}>No active challenges</Text>
            </GlassCard>
          )}
        </View>

        {/* Quick Actions — Admin only */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate("AdminSignalForm")}
              >
                <LinearGradient colors={["#0B3D1E", "#00C853"]} style={styles.actionGradient}>
                  <Text style={styles.actionIcon}>📈</Text>
                  <Text style={styles.actionLabel}>New Signal</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate("AdminChallengeForm", { type: "trading" })}
              >
                <LinearGradient colors={["#1A1A25", "#7C3AED"]} style={styles.actionGradient}>
                  <Text style={styles.actionIcon}>🏆</Text>
                  <Text style={styles.actionLabel}>New Challenge</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate("AdminChallengeForm", { type: "giveaway" })}
              >
                <LinearGradient colors={["#1A1A25", "#C9A227"]} style={styles.actionGradient}>
                  <Text style={styles.actionIcon}>🎁</Text>
                  <Text style={styles.actionLabel}>New Giveaway</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl * 1.5 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.white },
  headerSub: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", backgroundColor: colors.danger + "22", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.danger + "44" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger, marginRight: 5 },
  liveText: { color: colors.danger, fontSize: fontSizes.xs, fontWeight: "800" },
  content: { padding: spacing.md, marginTop: -spacing.lg },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, alignItems: "center", padding: spacing.sm },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: fontSizes.lg, fontWeight: "800" },
  statLabel: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  glassCard: {
    backgroundColor: colors.glass,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  seeAll: { fontSize: fontSizes.sm, color: colors.primary },
  signalCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  signalLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  signalAsset: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  dirBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  dirText: { fontSize: fontSizes.xs, fontWeight: "800" },
  signalMid: { flex: 1 },
  signalMeta: { fontSize: fontSizes.xs, color: colors.textSecondary },
  signalVal: { color: colors.text, fontWeight: "700" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  statusText: { fontSize: fontSizes.xs, fontWeight: "700" },
  emptyText: { color: colors.textMuted, textAlign: "center", fontSize: fontSizes.sm },
  challengeTitle: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },
  challengeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  progressBg: { height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: radius.pill, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: radius.pill },
  progressPct: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 4, textAlign: "right" },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  actionBtn: { flex: 1, borderRadius: radius.md, overflow: "hidden" },
  actionGradient: { padding: spacing.md, alignItems: "center", borderRadius: radius.md },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { color: colors.white, fontWeight: "700", fontSize: fontSizes.xs, textAlign: "center" }
});