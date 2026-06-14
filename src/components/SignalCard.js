// src/components/SignalCard.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

const statusColors = {
  Active: colors.info,
  "TP Hit": colors.success,
  "SL Hit": colors.danger,
  "BE Hit": colors.warning,
  Closed: colors.textMuted
};

export default function SignalCard({ signal, onPress, onEdit, onDelete, isAdmin }) {
  const directionColor = signal.direction === "SELL" ? colors.sell : colors.buy;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <View style={styles.assetRow}>
          <Text style={styles.asset}>{signal.asset}</Text>
          <View style={[styles.badge, { backgroundColor: directionColor }]}>
            <Text style={styles.badgeText}>{signal.direction}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColors[signal.status] || colors.textMuted }
          ]}
        >
          <Text style={styles.statusText}>{signal.status}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Detail label="Entry" value={signal.entry} />
        <Detail label="TP" value={signal.tp} color={colors.success} />
        <Detail label="SL" value={signal.sl} color={colors.danger} />
        {signal.be ? <Detail label="BE" value={signal.be} color={colors.warning} /> : null}
      </View>

      {signal.notes ? <Text style={styles.notes}>{signal.notes}</Text> : null}

      {isAdmin && (
        <View style={styles.adminRow}>
          <TouchableOpacity onPress={onEdit} style={[styles.adminBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.adminBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={[styles.adminBtn, { backgroundColor: colors.danger }]}>
            <Text style={styles.adminBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

function Detail({ label, value, color }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  assetRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  asset: { fontSize: fontSizes.lg, fontWeight: "700", color: colors.primary },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm
  },
  badgeText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.xs },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  statusText: { color: colors.white, fontSize: fontSizes.xs, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.xs },
  detail: { marginRight: spacing.lg, marginBottom: spacing.xs },
  detailLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  detailValue: { fontSize: fontSizes.md, fontWeight: "700", color: colors.text },
  notes: {
    marginTop: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    fontStyle: "italic"
  },
  adminRow: { flexDirection: "row", marginTop: spacing.sm, gap: spacing.sm },
  adminBtn: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm
  },
  adminBtnText: { color: colors.white, fontWeight: "600", fontSize: fontSizes.sm }
});
