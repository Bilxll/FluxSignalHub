import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";
import { useUser } from "../context/UserContext";

const { width } = Dimensions.get("window");

function GlassCard({ children, style, accent }) {
  return (
    <View style={[styles.glassCard, accent && { borderColor: accent + "40" }, style]}>
      {children}
    </View>
  );
}

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.statCard, { borderColor: color + "25" }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { profile } = useUser() || {};
  const [signals, setSignals] = useState([]);
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "signals"), orderBy("createdAt", "desc"), limit(5));
    return onSnapshot(q, snap => setSignals(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  useEffect(() => {
    const q = query(collection(db, "challenges"), orderBy("createdAt", "desc"), limit(3));
    return onSnapshot(q, snap => setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const active = signals.filter(s => s.status === "Active").length;
  const tp = signals.filter(s => s.status === "TP Hit").length;
  const sl = signals.filter(s => s.status === "SL Hit").length;
  const winRate = (tp + sl) > 0 ? Math.round((tp / (tp + sl)) * 100) : 0;

  const greeting = isAdmin
    ? "Welcome back, Admin"
    : `Hey, ${profile?.username || "Trader"} 👋`;

  return (
    <LinearGradient colors={colors.gradHome} style={styles.root} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>FLUX TRADERS</Text>
            <Text style={styles.greeting}>{greeting}</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Active" value={active} color={colors.info} />
          <StatCard label="Win Rate" value={`${winRate}%`} color={colors.success} />
          <StatCard label="TP Hits" value={tp} color={colors.success} />
          <StatCard label="SL Hits" value={sl} color={colors.danger} />
        </View>

        {/* Signals */}
        <Text style={styles.sectionLabel}>RECENT SIGNALS</Text>
        {signals.slice(0, 3).map(s => (
          <TouchableOpacity
            key={s.id}
            onPress={() => navigation.navigate("SignalDetail", { signal: s })}
            activeOpacity={0.8}
          >
            <GlassCard style={styles.signalCard}>
              <View style={styles.sigTop}>
                <View style={styles.sigLeft}>
                  <View style={[
                    styles.sigIcon,
                    { backgroundColor: s.direction === "BUY" ? colors.success + "15" : colors.danger + "15",
                      borderColor: s.direction === "BUY" ? colors.success + "30" : colors.danger + "30" }
                  ]}>
                    <Text style={[styles.sigArrow, { color: s.direction === "BUY" ? colors.success : colors.danger }]}>
                      {s.direction === "BUY" ? "↑" : "↓"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.sigAsset}>{s.asset}</Text>
                    <Text style={styles.sigSub}>{s.direction}</Text>
                  </View>
                </View>
                <View style={[styles.statusPill, {
                  backgroundColor: s.status === "TP Hit" ? colors.success + "15" :
                    s.status === "SL Hit" ? colors.danger + "15" : colors.info + "15",
                  borderColor: s.status === "TP Hit" ? colors.success + "30" :
                    s.status === "SL Hit" ? colors.danger + "30" : colors.info + "30"
                }]}>
                  <Text style={[styles.statusText, {
                    color: s.status === "TP Hit" ? colors.success :
                      s.status === "SL Hit" ? colors.danger : colors.info
                  }]}>{s.status}</Text>
                </View>
              </View>
              <View style={styles.sigGrid}>
                <SigCell label="ENTRY" value={s.entry} />
                <SigCell label="TP" value={s.tp} color={colors.success} bg={colors.success + "10"} />
                <SigCell label="SL" value={s.sl} color={colors.danger} bg={colors.danger + "10"} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        ))}

        {signals.length === 0 && (
          <GlassCard>
            <Text style={styles.emptyText}>No signals yet</Text>
          </GlassCard>
        )}

        {/* Challenges */}
        {challenges.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>ACTIVE CHALLENGES</Text>
            {challenges.filter(c => c.type === "trading").slice(0, 1).map(c => {
              const start = parseFloat(c.startBalance) || 0;
              const current = parseFloat(c.currentBalance) || 0;
              const target = parseFloat(c.targetBalance) || 0;
              const pct = target > start ? Math.min(1, Math.max(0, (current - start) / (target - start))) : 0;
              return (
                <GlassCard key={c.id} style={{ borderColor: colors.accent + "30" }}>
                  <View style={styles.chalTop}>
                    <Text style={styles.chalTitle}>{c.title}</Text>
                    <Text style={[styles.chalPct, { color: colors.accent }]}>{Math.round(pct * 100)}%</Text>
                  </View>
                  <View style={styles.chalRow}>
                    <ChalStat label="Start" value={c.startBalance} />
                    <ChalStat label="Current" value={c.currentBalance} color={colors.success} />
                    <ChalStat label="Target" value={c.targetBalance} color={colors.accent} />
                  </View>
                  <View style={styles.progBg}>
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={[styles.progFill, { width: `${pct * 100}%` }]}
                    />
                  </View>
                </GlassCard>
              );
            })}
          </>
        )}

        {/* Quick actions — Admin only */}
        {isAdmin && (
          <>
            <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
            <View style={styles.actionsRow}>
              <ActionBtn label="New Signal" color={colors.success} onPress={() => navigation.navigate("AdminSignalForm")} emoji="📈" />
              <ActionBtn label="Challenge" color={colors.purple} onPress={() => navigation.navigate("AdminChallengeForm", { type: "trading" })} emoji="🏆" />
              <ActionBtn label="Giveaway" color={colors.accent} onPress={() => navigation.navigate("AdminChallengeForm", { type: "giveaway" })} emoji="🎁" />
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

function SigCell({ label, value, color, bg }) {
  return (
    <View style={[styles.sigCell, bg && { backgroundColor: bg }]}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, color && { color }]}>{value}</Text>
    </View>
  );
}

function ChalStat({ label, value, color }) {
  return (
    <View style={styles.chalStat}>
      <Text style={styles.chalStatLabel}>{label}</Text>
      <Text style={[styles.chalStatValue, color && { color }]}>{value}</Text>
    </View>
  );
}

function ActionBtn({ label, color, onPress, emoji }) {
  return (
    <TouchableOpacity style={[styles.actionBtn, { borderColor: color + "30", backgroundColor: color + "10" }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: spacing.md, paddingTop: 60, paddingBottom: spacing.xl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.lg },
  appName: { fontSize: fontSizes.xs, color: colors.textMuted, letterSpacing: 2, marginBottom: 4 },
  greeting: { fontSize: fontSizes.xl, fontWeight: "800", color: colors.text, lineHeight: 28 },
  liveBadge: { flexDirection: "row", alignItems: "center", backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  liveText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.glass, borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, alignItems: "center" },
  statValue: { fontSize: fontSizes.lg, fontWeight: "800" },
  statLabel: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm, marginTop: spacing.xs },
  glassCard: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  signalCard: { marginBottom: spacing.sm },
  sigTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sigLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  sigIcon: { width: 36, height: 36, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  sigArrow: { fontSize: 16, fontWeight: "800" },
  sigAsset: { fontSize: fontSizes.md, fontWeight: "800", color: colors.text },
  sigSub: { fontSize: fontSizes.xs, color: colors.textMuted },
  statusPill: { borderRadius: radius.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 9, fontWeight: "700" },
  sigGrid: { flexDirection: "row", gap: 6 },
  sigCell: { flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: radius.sm, padding: 8, alignItems: "center" },
  cellLabel: { fontSize: 8, color: colors.textMuted, marginBottom: 2 },
  cellValue: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.text },
  emptyText: { color: colors.textMuted, textAlign: "center", fontSize: fontSizes.sm },
  chalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  chalTitle: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text, flex: 1 },
  chalPct: { fontSize: fontSizes.md, fontWeight: "800" },
  chalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  chalStat: { alignItems: "center" },
  chalStatLabel: { fontSize: 9, color: colors.textMuted, marginBottom: 2 },
  chalStatValue: { fontSize: fontSizes.sm, fontWeight: "700", color: colors.text },
  progBg: { height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: radius.pill, overflow: "hidden" },
  progFill: { height: 4, borderRadius: radius.pill },
  actionsRow: { flexDirection: "row", gap: spacing.sm },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: radius.md, padding: spacing.md, alignItems: "center", gap: 6 },
  actionEmoji: { fontSize: 22 },
  actionLabel: { fontSize: fontSizes.xs, fontWeight: "700", textAlign: "center" }
});