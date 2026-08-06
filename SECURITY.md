# SECURITY.md — Women Safety App

Companion to `PROJECT_CONTEXT.md` §16. Full security review based on direct inspection of the working tree (no `.git` history exists to check for prior leaks/exposure beyond the current files).

---

## 🔴 Critical

### 1. Google Maps API key committed in plaintext, in two locations
- **Where:** `lib/config.dart` (line 1) and `android/app/src/main/AndroidManifest.xml` (the `com.google.android.geo.API_KEY` meta-data tag).
- **Value:** `AIzaSyAz6mCNHHo6B2nTpcYJHOZbr-CkkDdQ86w` (identical string in both files).
- **Risk:** An unrestricted Google Maps API key committed to source control can be scraped and used by third parties, potentially generating unexpected billing on the project owner's Google Cloud account, or being used to exceed quota/rate-limit the legitimate app.
- **Remediation:**
  1. In Google Cloud Console, **rotate** this key immediately (generate a new one, disable the old one).
  2. Apply **application restrictions**: Android apps → restrict by package name (`com.example.women_safety_app`, or the real applicationId once changed) + SHA-1 certificate fingerprint.
  3. Apply **API restrictions**: limit the key to only "Maps SDK for Android" (and "Maps SDK for iOS" once that's wired up) — do not leave it unrestricted.
  4. Stop committing the key going forward: supply it via `--dart-define=GOOGLE_MAPS_API_KEY=...` at build time (read via `String.fromEnvironment`) for the Dart side, and via a gitignored `local.properties`-injected manifest placeholder or a gitignored `secrets.gradle`/`.env`-style file for the Android manifest side.
  5. Add the chosen secrets file(s) to `.gitignore`.
- **Note:** Since this repository currently has no `.git` directory, the key has not yet been exposed via GitHub history from *this* working copy — but treat it as compromised regardless, since it may already be public via a different clone/remote of this project.

---

## 🟠 High

### 2. Hardcoded single SOS recipient number
- **Where:** `lib/main.dart`, `sendSOS()` — `path: '7755922469'`.
- **Risk:** Not a classic security vulnerability, but a serious **functional-safety defect**: every installation of this app sends its SOS to the same fixed number, regardless of who the actual user's real emergency contact is. In a genuine emergency, this means the message may go to the wrong person (or a disconnected/placeholder number) rather than someone who can actually help. The code comment (`// Replace with your phone number`) confirms this was left as a manual placeholder, not a finished feature.
- **Remediation:** Before this app is used by anyone other than its developer for testing, this must become a per-user configurable value (tie into the "Emergency Contacts" feature, currently a locked stub with no logic).

---

## 🟡 Medium

### 3. Plaintext password storage
- **Where:** `lib/main.dart`, `AuthState._users` — stores `{'password': password, 'name': name}` with the raw password string, no hashing.
- **Risk:** Currently low real-world exposure since `AuthState` is in-memory only (never persisted or transmitted), but this pattern should not be carried forward into any persisted or networked auth system.
- **Remediation:** When auth work moves to Firebase Auth (or any real backend), do not attempt to migrate this in-memory user store — Firebase Auth handles credential hashing/storage itself. If a custom backend is ever built instead, use a proper password hashing algorithm (bcrypt/argon2), never store or log raw passwords.

### 4. No real authentication despite a full login/register UI
- **Where:** `lib/main.dart`, `LoginScreen` + `AuthState`.
- **Risk:** The app presents a convincing sign-in/registration flow with zero actual identity verification — "accounts" exist only for the current app process and vanish on restart. If presented to users (or judges) without caveats, this could be mistaken for a real, secure account system.
- **Remediation:** Be explicit in any demo/pitch that this is a UI placeholder pending Firebase Authentication integration (see `PROJECT_CONTEXT.md` §9).

---

## 🟢 Low / Informational

### 5. Missing `INTERNET` permission in the main Android manifest
- **Where:** `android/app/src/main/AndroidManifest.xml` declares only `ACCESS_FINE_LOCATION`/`ACCESS_COARSE_LOCATION`. `INTERNET` is present only in the `debug` and `profile` manifest variants (Flutter tooling auto-injects it there for hot reload/DevTools).
- **Risk:** Not a security issue — the opposite, arguably (least-privilege by accident). But it is a **functional time bomb**: a release build will lack `INTERNET`, which will silently break Google Maps tile loading and any future Firestore/network calls, with no obvious error message pointing at the permission as the cause.
- **Remediation:** Explicitly add `<uses-permission android:name="android.permission.INTERNET"/>` to the main manifest so it's present in release builds too.

### 6. Debug-signed release builds
- **Where:** `android/app/build.gradle.kts` — `release { signingConfig = signingConfigs.getByName("debug") }`, explicitly flagged with a `// TODO: Add your own signing config for the release build` comment.
- **Risk:** The Android debug keystore is a well-known, non-secret keystore shared across every Flutter/Android Studio installation by default. An APK "release" build signed this way offers no authenticity guarantee and could in principle be re-signed/impersonated by anyone using the same debug keystore.
- **Remediation:** Before any real distribution (even informal APK sharing beyond the dev team), generate a proper release keystore, store its path/passwords in a gitignored `key.properties`, and wire that into `build.gradle.kts`.

### 7. No established secrets-management convention
- **Where:** Project-wide — `.gitignore` is the stock Flutter template; it does not call out any secrets file by name because none has been designated yet.
- **Risk:** As Firebase service-account keys, a Flask API key/token, or Twilio credentials are added later, there's currently no existing pattern in this repo to keep them out of source control — the Maps key issue (finding #1) suggests this gap is real, not hypothetical.
- **Remediation:** Establish the convention now (e.g., a gitignored `lib/secrets.dart` + `lib/secrets.example.dart` checked-in template, or `--dart-define-from-file` with a gitignored JSON) before more secrets accumulate.

### 8. iOS location usage description not verified/present
- **Where:** `ios/Runner/Info.plist`.
- **Risk:** iOS requires `NSLocationWhenInUseUsageDescription` (and similar keys) to be present for the OS to even show the location-permission prompt; without it, the app would crash or silently fail to request permission on iOS. This is a functional gap more than a security one, but it's adjacent to permission-handling correctness, so it's noted here as well as in `PROJECT_CONTEXT.md` §14.
- **Remediation:** Add the required usage-description strings to `Info.plist` before attempting an iOS location-permission flow, alongside wiring the iOS Maps API key (see `PROJECT_CONTEXT.md` §7).

---

## Not applicable / out of scope for this review

- **No CI/CD pipeline exists** to review for secrets-in-logs or insecure deploy steps.
- **No `.git` history exists** in this working copy to scan for previously-committed-then-removed secrets.
- **No backend/server code exists** in this repository (Python/Flask/ML is entirely unimplemented) — nothing to review there yet; revisit this file once that work starts.

---

## Priority order for remediation

1. Rotate + restrict the Google Maps API key (Critical).
2. Add the missing `INTERNET` permission to the main manifest (Low effort, prevents a release-build regression).
3. Fix the hardcoded SOS recipient before any real-world use (High — safety-functional, not just security).
4. Establish a secrets-management convention before adding Firebase/Twilio credentials.
5. Address debug-signing and real authentication before any distribution beyond the dev team/hackathon demo.
