// src/screens/SignalsListScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, fontSizes } from "../theme/colors";
import SignalCard from "../components/SignalCard";
import { isAdmin } from "../utils/appVariant";

export default function SignalsListScreen({ navigation }) {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "signals"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setSignals(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = (id, asset) => {
    Alert.alert("Delete signal", `Remove the ${asset} signal?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteDoc(doc(db, "signals", id))
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={signals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: spacing.md }}
        renderItem={({ item }) => (
          <SignalCard
            signal={item}
            isAdmin={isAdmin}
            onPress={() => navigation.navigate("SignalDetail", { signal: item })}
            onEdit={() => navigation.navigate("AdminSignalForm", { signal: item })}
            onDelete={() => handleDelete(item.id, item.asset)}
          />
        )}
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {isAdmin
                  ? "No signals yet. Tap + to post your first signal."
                  : "No active signals right now. Check back soon."}
              </Text>
            </View>
          )
        }
      />

      {isAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AdminSignalForm")}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.textMuted, fontSize: fontSizes.md, textAlign: "center" },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },
  fabText: { color: colors.white, fontSize: 32, lineHeight: 34 }
});
