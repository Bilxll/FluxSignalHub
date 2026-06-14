import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqfTMHEw0L4GT2Ve_1mk8GIiRm7KzpQgM",
  authDomain: "flux-trader-signal-hub-a970c.firebaseapp.com",
  projectId: "flux-trader-signal-hub-a970c",
  storageBucket: "flux-trader-signal-hub-a970c.firebasestorage.app",
  messagingSenderId: "630391919632",
  appId: "1:630391919632:web:8ad84029a7b75dfdf5a695"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };