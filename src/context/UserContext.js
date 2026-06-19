import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc, setDoc, getDoc, query,
  collection, where, getDocs, serverTimestamp
} from "firebase/firestore";
import { auth } from "../firebase/firebaseConfig";
import { db } from "../firebase/firebaseConfig";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) setProfile(snap.data());
      } else {
        setProfile(null);
      }
      setInitializing(false);
    });
    return unsub;
  }, []);

  const checkUsername = async (username) => {
    const q = query(
      collection(db, "users"),
      where("usernameLower", "==", username.toLowerCase())
    );
    const snap = await getDocs(q);
    return snap.empty;
  };

  const register = async (email, password, username) => {
    const available = await checkUsername(username);
    if (!available) throw new Error("Username already taken. Please choose another.");

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile = {
      uid: cred.user.uid,
      email: email.toLowerCase(),
      username: username.trim(),
      usernameLower: username.toLowerCase().trim(),
      joinedAt: serverTimestamp()
    };
    await setDoc(doc(db, "users", cred.user.uid), userProfile);
    setProfile(userProfile);
    return cred;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (snap.exists()) setProfile(snap.data());
    return cred;
  };

  const logout = () => {
    setProfile(null);
    return signOut(auth);
  };

  return (
    <UserContext.Provider value={{ user, profile, initializing, register, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);