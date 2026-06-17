import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

function GlassCard({ children, style }) {
  return <View style={[styles.glassCard, style]}>{children}</View>;
}

const POPULAR = ["XAUUSD", "EURUSD", "GBPUSD", "BTCUSD", "ETHUSD", "USDJPY", "USDCHF", "AUDUSD"];

export default function WatchlistScreen({ navigation }) {
  const [watchlist, setWatchlist] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("watchlist").then(data => {
      if (data) setWatchlist(JSON.parse(data));
    });
  }, []);

  const save = async (list) => {
    setWatchlist(list);
    await AsyncStorage.setItem("watchlist", JSON.stringify(list));
  };

  const addAsset = async (symbol) => {
    const s = symbol.trim().toUpperCase();
    if (!s) return;
    if (watchlist.includes(s)) {
      Alert.alert("Already added", `${s} is already in your watchlist.`);
      return;
    }
    await save([...watchlist, s]);
    setInput("");
  };

  const removeAsset = async (symbol) => {
    Alert.alert("Remove", `Remove ${symbol} from watchlist?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => save(watchlist.filter(s => s !== symbol)) }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A1A3D", "#0A0A0F"]} style={styles.header}>
        <Text style={styles.headerTitle}>Watchlist</Text>
        <Text style={styles.headerSub}>Track your favourite assets</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={input}
            onChangeText={setInput}
            placeholder="Add asset (e.g. XAUUSD)"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            onSubmitEditing={() => addAsset(input)}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => addAsset(input)}
          >
            <LinearGradient colors={["#0B3D1E", "#00C853"]} style={styles.addBtnInner}>
              <Text style={styles.addBtnText}>Add</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Popular suggestions */}
        <Text style={styles.sectionLabel}>Quick add</Text>
        <View style={styles.suggestionsRow}>
          {POPULAR.filter(p => !watchlist.includes(p)).slice(0, 6).map(s => (
            <TouchableOpacity
              key={s}
              style={styles.suggestion}
              onPress={() => addAsset(s)}
            >
              <Text style={styles.suggestionText}>+ {s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Watchlist */}
        <Text style={styles.sectionLabel}>Your watchlist ({watchlist.length})</Text>
        {watchlist.length === 0 ? (
          <GlassCard>
            <Text style={styles.emptyText}>No assets yet. Add one above!</Text>
          </GlassCard>
        ) : (
          <FlatList
            data={watchlist}
            keyExtractor={i => i}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Charts")}
              >
                <GlassCard style={styles.assetRow}>
                  <View style={styles.assetLeft}>
                    <Text style={styles.assetSymbol}>{item}</Text>
                    <Text style={styles.assetSub}>Tap to view chart</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeAsset(item)}
                    style={styles.removeBtn}
                  >
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </GlassCard>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  headerTitle: { fontSize: fontSizes.xxl, fontWeight: "800", color: colors.white },
  headerSub: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.5)", marginTop: 4 },
  content: { padding: spacing.md },
  searchRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  searchInput: { flex: 1, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.sm, paddingHorizontal: spacing.md, fontSize: fontSizes.md, color: colors.text },
  addBtn: { borderRadius: radius.sm, overflow: "hidden" },
  addBtnInner: { paddingHorizontal: spacing.lg, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSizes.sm },
  sectionLabel: { fontSize: fontSizes.sm, color: colors.textMuted, fontWeight: "700", marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 1 },
  suggestionsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md },
  suggestion: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  suggestionText: { color: colors.primary, fontSize: fontSizes.xs, fontWeight: "700" },
  glassCard: { backgroundColor: colors.glass, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glassBorder, padding: spacing.md, marginBottom: spacing.sm },
  assetRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  assetLeft: {},
  assetSymbol: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.text },
  assetSub: { fontSize: fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  removeBtn: { padding: spacing.sm },
  removeBtnText: { color: colors.danger, fontSize: fontSizes.md, fontWeight: "800" },
  emptyText: { color: colors.textMuted, textAlign: "center" }
});