import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection, onSnapshot, query,
  orderBy, deleteDoc, doc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";

const TIER_CONFIG = {
  VIP: { color: "#C9A227", icon: "👑", gradient: ["#3D2E00", "#C9A227"] },
  Pro: { color: "#7C3AED", icon: "⚡", gradient: ["#1A0A3D", "#7C3AED"] },
  Basic: { color: "#0EA5E9", icon: "🔵", gradient: ["#0A1A3D", "#0EA5E9"] }
};

function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

export default function MembersScreen({ navigation }) {
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "memberTiers"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, snap => {
      setTiers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleDelete = (id, name) => {
    Alert.alert("Delete tier", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "memberTiers", id)) }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Header */}
      <LinearGradient colors={["#1A0A3D", "#0A0A0F"]} style={styles.header}>
        <Text style={styles.headerTitle}>Members Area</Text>
        <Text style={styles.headerSub}>Choose your membership tier</Text>
      </LinearGradient>

      <View style={styles.content}>
        {tiers.map(tier => {
          const config = TIER_CONFIG[tier.name] || TIER_CONFIG.Basic;
          return (
            <View key={tier.id} style={styles.tierCard}>
              <LinearGradient
                colors={config.gradient}
                style={styles.tierGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.tierHeader}>
                  <Text style={styles.tierIcon}>{config.icon}</Text>
                  <View>
                    <Text style={styles.tierName}>{tier.name}</Text>
                    <Text style={styles.tierPrice}>{tier.price}</Text>
                  </View>
                  {tier.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>POPULAR</Text>
                    </View>
                  )}
                </View>

                {tier.description ? (
                  <Text style={styles.tierDesc}>{tier.description}</Text>
                ) : null}

                <View style={styles.divider} />

                {(tier.features || []).map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}

                {tier.contactLink ? (
                  <View style={styles.contactBox}>
                    <Text style={styles.contactLabel}>How to join:</Text>
                    <Text style={styles.contactLink}>{tier.contactLink}</Text>
                  </View>
                ) : null}

                {isAdmin && (
                  <View style={styles.adminRow}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => navigation.navigate("AdminMemberTierForm", { tier })}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(tier.id, tier.name)}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            </View>
          );
        })}

        {tiers.length === 0 && (
          <GlassCard>
            <Text style={styles.emptyText}>
              {isAdmin ? "No tiers yet. Tap + to create one." : "Membership tiers coming soon."}
            </Text>
          </GlassCard>
        )}
      </View>

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AdminMemberTierForm")}
        >
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
  header: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  headerTitle: { fontSize: fontSizes.xxl, fontWeight: "800", color: colors.white },
  headerSub: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  content: { padding: spacing.md },
  tierCard: { borderRadius: radius.lg, overflow: "hidden", marginBottom: spacing.md },
  tierGradient: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  tierHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  tierIcon: { fontSize: 36 },
  tierName: { fontSize: fontSizes.xl, fontWeight: "800", color: colors.white },
  tierPrice: { fontSize: fontSizes.md, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  popularBadge: { marginLeft: "auto", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  popularText: { color: colors.white, fontSize: fontSizes.xs, fontWeight: "800" },
  tierDesc: { color: "rgba(255,255,255,0.7)", fontSize: fontSizes.sm, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: spacing.md },
  featureRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  featureCheck: { color: colors.success, fontWeight: "800", fontSize: fontSizes.md },
  featureText: { color: "rgba(255,255,255,0.85)", fontSize: fontSizes.sm, flex: 1 },
  contactBox: { marginTop: spacing.md, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: radius.sm, padding: spacing.sm },
  contactLabel: { color: "rgba(255,255,255,0.5)", fontSize: fontSizes.xs },
  contactLink: { color: colors.white, fontWeight: "700", fontSize: fontSizes.sm, marginTop: 2 },
  adminRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  editBtn: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  editBtnText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.sm },
  deleteBtn: { backgroundColor: colors.danger + "33", paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  deleteBtnText: { color: colors.danger, fontWeight: "700", fontSize: fontSizes.sm },
  glassCard: { backgroundColor: colors.glass, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, padding: spacing.md, marginBottom: spacing.sm },
  emptyText: { color: colors.textMuted, textAlign: "center" },
  fab: { position: "absolute", right: spacing.lg, bottom: spacing.lg, borderRadius: radius.pill, overflow: "hidden" },
  fabGradient: { width: 56, height: 56, alignItems: "center", justifyContent: "center" },
  fabText: { color: colors.white, fontSize: 32, lineHeight: 34 }
});