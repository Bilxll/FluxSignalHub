// src/screens/ChartsScreen.js
import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import { colors, spacing, radius, fontSizes } from "../theme/colors";

export default function ChartsScreen() {
  const [symbol, setSymbol] = useState("OANDA:XAUUSD");
  const [input, setInput] = useState("XAUUSD");

  const buildHtml = (sym) => `
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
            "symbol": "${sym}",
            "interval": "60",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#F7F2E7",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "withdateranges": true,
            "studies": ["RSI@tv-basicstudies"],
            "container_id": "tv"
          });
        </script>
      </body>
    </html>
  `;

  const go = () => {
    let s = input.trim().toUpperCase();
    if (!s) return;
    if (!s.includes(":")) {
      if (s.includes("USDT") || s.includes("BTC") || s.includes("ETH")) {
        s = `BINANCE:${s}`;
      } else {
        s = `OANDA:${s}`;
      }
    }
    setSymbol(s);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="e.g. XAUUSD, EURUSD, BTCUSDT"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          onSubmitEditing={go}
        />
        <TouchableOpacity style={styles.goBtn} onPress={go}>
          <Text style={styles.goBtnText}>Go</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.chartWrap}>
        <WebView key={symbol} source={{ html: buildHtml(symbol) }} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: "row", padding: spacing.md, gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text
  },
  goBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    justifyContent: "center"
  },
  goBtnText: { color: colors.white, fontWeight: "700" },
  chartWrap: { flex: 1, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radius.md, overflow: "hidden", borderWidth: 1, borderColor: colors.border }
});
