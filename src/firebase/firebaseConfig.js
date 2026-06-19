import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAqfTMHEw0L4GT2Ve_1mk8GIiRm7KzpQgM",
  authDomain: "flux-trader-signal-hub-a970c.firebaseapp.com",
  projectId: "flux-trader-signal-hub-a970c",
  storageBucket: "flux-trader-signal-hub-a970c.firebasestorage.app",
  messagingSenderId: "630391919632",
  appId: "1:630391919632:web:8ad84029a7b75dfdf5a695"
};

let app, auth, db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} else {
  app = getApp();
  auth = getAuth(app);
}

db = getFirestore(app);

export { app, db, auth };