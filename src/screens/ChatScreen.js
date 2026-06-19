import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  collection, addDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp,
  deleteDoc, doc
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { colors, spacing, radius, fontSizes } from "../theme/colors";
import { isAdmin } from "../utils/appVariant";
import { useUser } from "../context/UserContext";
import { broadcastNotification } from "../utils/notifications";

function getAvatarColor(username) {
  const palette = [
    "#0EA5E9", "#7C3AED", "#C9A227",
    "#FF3B5C", "#00C853", "#F97316"
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + hash;
  return palette[Math.abs(hash) % palette.length];
}

export default function ChatScreen() {
  const { profile } = useUser() || {};
  const [messages, setMessages] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [text, setText] = useState("");
  const [broadcastText, setBroadcastText] = useState("");
  const [showBroadcast, setShowBroadcast] = useState(false);
  const flatRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, "chatMessages"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "broadcasts"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const unsub = onSnapshot(q, snap => {
      setBroadcasts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const username = profile?.username || "Anonymous";
    await addDoc(collection(db, "chatMessages"), {
      text: text.trim(),
      username,
      uid: profile?.uid || "anon",
      isAdmin: false,
      createdAt: serverTimestamp()
    });
    setText("");
  };

  const sendBroadcast = async () => {
    if (!broadcastText.trim()) return;
    await addDoc(collection(db, "broadcasts"), {
      text: broadcastText.trim(),
      createdAt: serverTimestamp()
    });
    await broadcastNotification({
      title: "📢 FLUX Admin Announcement",
      body: broadcastText.trim(),
      data: { type: "broadcast" }
    });
    setBroadcastText("");
    setShowBroadcast(false);
  };

  const deleteMessage = (id) => {
    Alert.alert("Delete message", "Remove this message?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteDoc(doc(db, "chatMessages", id)) }
    ]);
  };

  const reversedMessages = [...messages].reverse();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <LinearGradient colors={["#0B3D1E", "#0A0A0F"]} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Live Chat</Text>
              <Text style={styles.headerSub}>Community · Real-time</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Broadcasts */}
        {broadcasts.length > 0 && (
          <View style={styles.broadcastsWrap}>
            {broadcasts.map(b => (
              <View key={b.id} style={styles.broadcastCard}>
                <View style={styles.broadcastTop}>
                  <View style={styles.broadcastIconWrap}>
                    <Text style={{ fontSize: 11 }}>📢</Text>
                  </View>
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                  </View>
                </View>
                <Text style={styles.broadcastText}>{b.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Admin broadcast form */}
        {isAdmin && showBroadcast && (
          <View style={styles.broadcastForm}>
            <TextInput
              style={styles.broadcastInput}
              value={broadcastText}
              onChangeText={setBroadcastText}
              placeholder="Type broadcast message..."
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <View style={styles.broadcastFormBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBroadcast(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendBroadcastBtn} onPress={sendBroadcast}>
                <Text style={styles.sendBroadcastText}>Send Broadcast</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={reversedMessages}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isOwn = item.uid === profile?.uid;
            const avatarColor = getAvatarColor(item.username || "?");
            const initials = (item.username || "?").substring(0, 2).toUpperCase();
            return (
              <TouchableOpacity
                onLongPress={() => isAdmin && deleteMessage(item.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.msgRow, isOwn && styles.msgRowOwn]}>
                  {!isOwn && (
                    <View style={[styles.avatar, { backgroundColor: avatarColor + "33", borderColor: avatarColor + "55" }]}>
                      <Text style={[styles.avatarText, { color: avatarColor }]}>{initials}</Text>
                    </View>
                  )}
                  <View style={[styles.msgWrap, isOwn && styles.msgWrapOwn]}>
                    {!isOwn && <Text style={styles.msgUsername}>{item.username}</Text>}
                    <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                      <Text style={styles.bubbleText}>{item.text}</Text>
                    </View>
                  </View>
                  {isOwn && (
                    <View style={[styles.avatar, { backgroundColor: colors.primary + "33", borderColor: colors.primary + "55" }]}>
                      <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No messages yet. Be the first to say something! 👋</Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.broadcastBtn}
              onPress={() => setShowBroadcast(!showBroadcast)}
            >
              <Text style={{ fontSize: 18 }}>📢</Text>
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <LinearGradient colors={["#0B3D1E", "#00C853"]} style={styles.sendBtnInner}>
              <Text style={{ fontSize: 16 }}>➤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: fontSizes.lg, fontWeight: "800", color: colors.white },
  headerSub: { fontSize: fontSizes.xs, color: "rgba(255,255,255,0.4)", marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,200,83,0.12)", borderWidth: 1, borderColor: "rgba(0,200,83,0.25)", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  liveText: { fontSize: fontSizes.xs, color: colors.primary, fontWeight: "700" },
  broadcastsWrap: { padding: spacing.md, paddingBottom: 0, gap: spacing.sm },
  broadcastCard: { backgroundColor: "rgba(201,162,39,0.08)", borderWidth: 1, borderColor: "rgba(201,162,39,0.2)", borderRadius: radius.md, padding: spacing.md },
  broadcastTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 6 },
  broadcastIconWrap: { width: 24, height: 24, borderRadius: 7, backgroundColor: "rgba(201,162,39,0.2)", alignItems: "center", justifyContent: "center" },
  adminBadge: { backgroundColor: "rgba(201,162,39,0.2)", borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  adminBadgeText: { fontSize: fontSizes.xs, color: colors.accent, fontWeight: "700" },
  broadcastText: { fontSize: fontSizes.sm, color: "rgba(255,255,255,0.8)", lineHeight: 18 },
  broadcastForm: { margin: spacing.md, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.md, padding: spacing.md },
  broadcastInput: { color: colors.text, fontSize: fontSizes.sm, minHeight: 60, textAlignVertical: "top" },
  broadcastFormBtns: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.glassBorder },
  cancelBtnText: { color: colors.textMuted, fontWeight: "600", fontSize: fontSizes.sm },
  sendBroadcastBtn: { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.sm },
  sendBroadcastText: { color: colors.white, fontWeight: "700", fontSize: fontSizes.sm },
  messagesList: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, marginBottom: spacing.sm },
  msgRowOwn: { flexDirection: "row-reverse" },
  avatar: { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { fontSize: fontSizes.xs, fontWeight: "800" },
  msgWrap: { flex: 1 },
  msgWrapOwn: { alignItems: "flex-end" },
  msgUsername: { fontSize: fontSizes.xs, color: colors.textMuted, marginBottom: 3, marginLeft: 4 },
  bubble: { maxWidth: "80%", padding: spacing.sm, borderRadius: radius.md },
  bubbleOther: { backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderBottomLeftRadius: 4 },
  bubbleOwn: { backgroundColor: "rgba(0,200,83,0.15)", borderWidth: 1, borderColor: "rgba(0,200,83,0.2)", borderBottomRightRadius: 4 },
  bubbleText: { fontSize: fontSizes.sm, color: colors.text, lineHeight: 18 },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyText: { color: colors.textMuted, textAlign: "center", fontSize: fontSizes.sm },
  inputBar: { flexDirection: "row", padding: spacing.sm, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.glassBorder, backgroundColor: colors.backgroundSecondary, alignItems: "center" },
  broadcastBtn: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: "rgba(201,162,39,0.12)", alignItems: "center", justifyContent: "center" },
  input: { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: colors.glassBorder, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: fontSizes.sm, color: colors.text },
  sendBtn: { borderRadius: radius.sm, overflow: "hidden" },
  sendBtnInner: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }
});