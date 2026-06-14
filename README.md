# FLUX Traders App

One codebase that builds **two apps**:

| App | Who uses it | What it can do |
|---|---|---|
| **FLUX Admin** (`APP_VARIANT=admin`) | You / your team | Post & edit signals, manage trading challenges & giveaways, manage the compounding tracker, send push notifications |
| **FLUX Signals** (`APP_VARIANT=receiver`) | Your subscribers | View live signals, challenges, giveaways, compounding sheet, charts. Gets push notifications instantly |

Theme: cream background (`#F7F2E7`) with the dark green from your FLUX logo (`#0B3D1E`) and a gold accent (`#C9A227`).

---

## 1. What you need first

- A free [Expo](https://expo.dev) account
- A free [Firebase](https://console.firebase.google.com) account (Google account)
- Node.js installed on your computer (download from nodejs.org)
- This project folder, unzipped, on your computer

---

## 2. Set up Firebase (one-time, ~10 minutes)

1. Go to https://console.firebase.google.com → **Add project** → name it `FluxTraders`.
2. In the project, go to **Build → Firestore Database → Create database** → start in **production mode** → pick a region.
3. Go to **Build → Authentication → Sign-in method** → enable **Email/Password**.
4. Go to **Authentication → Users → Add user** → create your admin login (this is what you'll log into the Admin app with).
5. Go to **Project settings (gear icon) → General → Your apps → Add app → Web (</> icon)**. Register it (any nickname). Copy the `firebaseConfig` object it shows you.
6. Open `src/firebase/firebaseConfig.js` in this project and paste your values in, replacing all the `"REPLACE_ME"` strings.
7. Go to **Firestore Database → Rules** and paste in the contents of `firestore.rules` from this project, then **Publish**.

### Push notifications setup (Android)
1. Still in **Project settings → Your apps**, click **Add app → Android**.
   - Package name: `com.fluxtraders.admin` (do this once)
   - Download the `google-services.json` → rename to `google-services.admin.json` → place it in the project root.
   - Repeat: **Add app → Android** again with package name `com.fluxtraders.receiver` → download → rename to `google-services.receiver.json` → place in project root.
2. (iOS, optional for now) Add iOS apps with bundle IDs `com.fluxtraders.admin` / `com.fluxtraders.receiver`, download the `GoogleService-Info.plist` files, rename to `GoogleService-Info.admin.plist` and `GoogleService-Info.receiver.plist`, place in project root.

---

## 3. Set up Expo (one-time)

```bash
npm install -g eas-cli
cd flux-trading-app
npm install
eas login          # log in with your Expo account
eas init            # creates an EAS project, copy the projectId it gives you
```

Paste that **projectId** into:
- `app.config.js` → `extra.eas.projectId`
- `src/utils/notifications.js` → both `projectId: "REPLACE-WITH-YOUR-EAS-PROJECT-ID"` lines

---

## 4. Run it locally on your phone (fastest way to test)

1. Install the **Expo Go** app from the Play Store / App Store on your phone.
2. In the project folder, run:

```bash
# To test the ADMIN app
APP_VARIANT=admin npx expo start

# To test the RECEIVER app (in a second terminal/folder copy, or stop the first)
APP_VARIANT=receiver npx expo start
```

3. Scan the QR code with the Expo Go app (Android: scan directly in Expo Go; iOS: scan with Camera app).

> Note: Push notifications and some native features only fully work in a **real build** (step 5), not in Expo Go. Use Expo Go for fast UI/feature testing.

---

## 5. Build real APKs (Android) and IPAs (iOS)

This uses **EAS Build** — Expo's free cloud build service. No Android Studio or Mac needed.

### Build the Admin APK
```bash
APP_VARIANT=admin eas build --platform android --profile preview
```

### Build the Receiver APK
```bash
APP_VARIANT=receiver eas build --platform android --profile preview
```

Each command will:
- Upload your code to Expo's build servers
- Build the app (takes ~10-20 minutes)
- Give you a **download link** for the `.apk` file when done (also viewable at https://expo.dev under your project's Builds tab)

### Installing the APK on an Android phone
1. Open the build link on your phone (or transfer the `.apk` file to your phone).
2. Tap the `.apk` file to install.
3. If prompted "Install blocked" → go to **Settings → Security → allow installs from this source** (or "Install unknown apps") and try again.
4. Install both apps — you'll see "FLUX Admin" and "FLUX Signals" as separate apps on your phone.

### Building for iPhone (iOS)
```bash
APP_VARIANT=admin eas build --platform ios --profile preview
APP_VARIANT=receiver eas build --platform ios --profile preview
```
- For iOS, you'll need to log in with your Apple Developer account when prompted (EAS will guide you through certificates automatically).
- Internal `preview` builds can be installed via **TestFlight** or direct device installs registered to your Apple Developer account. Since you have a paid Apple Developer account, EAS can register your test devices automatically — follow the prompts.

### Publishing to Play Store / App Store later
When ready for the public:
```bash
APP_VARIANT=admin eas build --platform android --profile production
APP_VARIANT=receiver eas build --platform android --profile production
```
This produces `.aab` files ready to upload to Google Play Console. For iOS, use:
```bash
eas submit --platform ios
```
to send the build straight to App Store Connect.

---

## 6. How everything works

### Posting a signal
Admin → Signals tab → `+` → fill in Asset, Direction, Entry, TP, SL, BE (optional), Notes → **Post Signal**.
- This instantly appears in the Receiver app's Signals tab (Firestore real-time sync).
- A push notification is sent to every device that has the Receiver app installed.

### Updating a signal (e.g. TP hit, SL hit, BE)
Admin → Signals tab → **Edit** on a signal → change the **Status** pill (Active / TP Hit / SL Hit / BE Hit / Closed) → **Update Signal**.
- This also sends a push notification with the new status.

### Trading Challenges & Giveaways
Challenges tab has two sub-tabs. Admin can create/edit/delete in either. Both broadcast notifications on create/update.
- **Trading Challenge**: set Start Balance, Current Balance, Target Balance — receivers see a live progress bar.
- **Giveaway**: set Prize, Ends At date, Rules, and later set the Winner field to announce results.

### Compounding Tracker ("Google Sheet" tab)
Compounding tab. Admin taps **+ Add Row**, enters a starting balance and a gain/loss %, and the app auto-calculates profit and ending balance. Each row is shown in a table plus a growth line chart — exactly like a compounding spreadsheet, synced in real time to all receivers. Long-press a row (as admin) to edit it.

### Charts
- Every signal's detail page shows a live **TradingView chart** for that asset.
- The Charts tab is a free-search TradingView chart (type any symbol like `XAUUSD`, `EURUSD`, `BTCUSDT`) with indicators like RSI built in.

---

## 7. Customizing

- **Colors**: edit `src/theme/colors.js`
- **Logo**: replace `assets/logo.png` (keep it square, ideally 1024x1024 for app icons)
- **App names / package IDs**: edit `app.config.js`

---

## 8. Troubleshooting

- **"No registered devices to notify"**: the receiver app needs to have been opened at least once on a real device (not simulator) with notification permission granted, so it can register its push token.
- **Charts not loading**: TradingView's widget requires an internet connection; it won't render in airplane mode.
- **Login fails on Admin app**: double-check the email/password you created in Firebase Authentication → Users.
- **Build fails on EAS**: run `eas build` again and read the build logs link it prints — most issues are missing `google-services.json` files or an outdated `projectId`.
