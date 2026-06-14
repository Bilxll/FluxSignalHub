// src/utils/notifications.js
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import {
  collection,
  doc,
  setDoc,
  getDocs
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

// Show notifications even while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

/**
 * Call this once on app start in the RECEIVER app.
 * Registers the device for push notifications and stores its
 * Expo push token in the `pushTokens` Firestore collection so the
 * admin app can broadcast to it.
 */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId: "227c86f8-1006-4af7-a9bd-d41386196d8b"
  });
  const token = tokenResponse.data;

  // Save token to Firestore so the admin app can send to it
  await setDoc(doc(db, "pushTokens", token), {
    token,
    platform: Platform.OS,
    updatedAt: new Date().toISOString()
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0B3D1E"
    });
  }

  return token;
}

/**
 * Call this from the ADMIN app whenever a new signal is posted/updated
 * or a challenge/giveaway announcement is made.
 *
 * Sends a push notification to every registered receiver device using
 * Expo's push notification service (no extra server needed).
 */
export async function broadcastNotification({ title, body, data = {} }) {
  const snap = await getDocs(collection(db, "pushTokens"));
  const tokens = snap.docs.map((d) => d.id).filter(Boolean);

  if (tokens.length === 0) {
    console.log("No registered devices to notify");
    return { sent: 0 };
  }

  // Expo push API accepts batches of up to 100 messages
  const chunks = [];
  for (let i = 0; i < tokens.length; i += 99) {
    chunks.push(tokens.slice(i, i + 99));
  }

  for (const chunk of chunks) {
    const messages = chunk.map((to) => ({
      to,
      sound: "default",
      title,
      body,
      data
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messages)
    });
  }

  return { sent: tokens.length };
}
