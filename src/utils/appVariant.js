// src/utils/appVariant.js
import Constants from "expo-constants";

// Returns "admin" or "receiver" depending on which app was built/run
export const APP_VARIANT = Constants.expoConfig?.extra?.APP_VARIANT || "receiver";

export const isAdmin = APP_VARIANT === "admin";
