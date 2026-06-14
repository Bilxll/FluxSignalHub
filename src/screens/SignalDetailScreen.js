// src/screens/SignalDetailScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

// Maps a signal's asset name to a TradingView symbol.
// Adjust this mapping as needed for your typical instruments.
function toTradingViewSymbol(asset) {
  const a = asset.toUpperCase();
  if (a.includes("XAU")) return "OANDA:XAUUSD";
  if (a.includes("BTC")) return "BINANCE:BTCUSDT";
  if (a.includes("ETH")) return "BINANCE:ETHUSDT";
  if (a.length === 6) return `OANDA:${a}`; // e.g. EURUSD
  return `OANDA:${a}`;
}

export default function SignalDetailScreen({ route }) {
  const { signal } = route.params;
  const symbol = toTradingViewSymbol(signal.asset);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>html,body,#tv{margin:0;padding:0;height:100%;background:#F7F2E7;}</style>
      </head>
      <body>
        <div id="tv"></div>
        <script src="https://s3.tradingview.com/tv.js"></script>
        <script>
          new TradingView.widget({
            "autosize": true,
            "symbol": "${symbol}",
            "interval": "60",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#F7F2E7",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "container_id": "tv"
          });
        </script>
      </body>
    </html>
  `;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.asset}>{signal.asset}</Text>
        <Text
          style={[
            styles.direction,
            { color: signal.direction === "SELL" ? colors.sell : colors.buy }
          ]}
        >
          {signal.direction}
        </Text>
      </View>

      <View style={styles.chartWrap}>
        <WebView source={{ html }} style={styles.chart} />
      </View>

      <View style={styles.detailsCard}>
        <Row label="Entry" value={signal.entry} />
        <Row label="Take Profit" value={signal.tp} color={colors.success} />
        <Row label="Stop Loss" value={signal.sl} color={colors.danger} />
        {signal.be ? <Row label="Break Even" value={signal.be} color={colors.warning} /> : null}
        <Row label="Status" value={signal.status} />
        {signal.notes ? (
          <View style={{ marginTop: spacing.sm }}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notes}>{signal.notes}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function Row({ label, value, color }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md
  },
  asset: { fontSize: fontSizes.xl, fontWeight: "800", color: colors.primary },
  direction: { fontSize: fontSizes.lg, fontWeight: "800" },
  chartWrap: {
    height: 320,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border
  },
  chart: { flex: 1 },
  detailsCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  rowLabel: { color: colors.textMuted, fontSize: fontSizes.sm },
  rowValue: { color: colors.text, fontWeight: "700", fontSize: fontSizes.md },
  notesLabel: { color: colors.textMuted, fontSize: fontSizes.sm, marginBottom: 4 },
  notes: { color: colors.text, fontSize: fontSizes.md, fontStyle: "italic" }
});
