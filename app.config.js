const IS_ADMIN = process.env.APP_VARIANT === "admin";

const name = IS_ADMIN ? "FLUX Admin" : "FLUX Signals";
const slug = "flux-traders-signal-hub";
const androidPackage = IS_ADMIN
  ? "com.fluxtraders.admin"
  : "com.fluxtraders.receiver";
const iosBundleId = IS_ADMIN
  ? "com.fluxtraders.admin"
  : "com.fluxtraders.receiver";

export default {
  expo: {
    owner: "bilxlll",
    slug,
    name,
    scheme: slug,
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#F7F2E7"
    },
    extra: {
      APP_VARIANT: IS_ADMIN ? "admin" : "receiver",
      eas: {
        projectId: "227c86f8-1006-4af7-a9bd-d41386196d8b"
      }
    },
    android: {
      package: androidPackage,
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#F7F2E7"
      },
      permissions: ["NOTIFICATIONS", "INTERNET"]
    },
    ios: {
      bundleIdentifier: iosBundleId,
      supportsTablet: false
    },
    plugins: [
      "expo-notifications"
    ]
  }
};