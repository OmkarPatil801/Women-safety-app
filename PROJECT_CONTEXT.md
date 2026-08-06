# PROJECT_CONTEXT.md — Women Safety App

> **Purpose of this document**: This is the permanent, long-term memory of the project. It reflects the codebase **as it actually exists today** (verified by direct inspection of every file), not the aspirational description in the README. Where the README describes planned/future work, this is explicitly marked. Future Claude sessions should read this file first before making changes.
>
> **Analysis date:** 2026-08-05
> **Repository state:** Not currently a git repository (no `.git` directory found, despite a `.gitignore` being present). No commit history exists to inspect.

---

## 1. PROJECT SUMMARY

**Project Name:** Women Safety App (`women_safety_app`)

**Purpose:** A Flutter mobile application that gives users a fast, low-friction way to alert an emergency contact with their live GPS location, plus a map view of their surroundings.

**Problem Statement (per README):** Existing safety apps depend heavily on constant connectivity and are purely reactive. This project's stated ambition is to combine emergency response with preventive, community-driven safety intelligence, and to keep working in low-connectivity environments.

**Reality check:** The *implemented* product today is much narrower than the stated ambition — it is a single-screen SOS utility with a login stub and a map screen. There is no connectivity-awareness, no offline storage, no community data, and no backend. See [Section 5](#5-current-features) vs [Section 6](#6-future-features) for the precise line between what exists and what is planned.

**Target Users:** Individuals (primarily women, per the app's framing) seeking a quick personal-safety SOS tool with location sharing and situational awareness via a map.

**Current Development Stage:** **Early-stage prototype / hackathon MVP.**
- Single-screen Flutter UI plus a secondary map screen.
- No backend, no persistence, no real authentication.
- Hardcoded emergency contact number and hardcoded API key.
- Suitable for a demo, not for production or public release in its current form.

**Vision (per README):** Grow into an offline-first safety platform: local Hive caching, Firebase sync, community-reported unsafe zones, an ML-driven risk/heatmap layer, safe-route recommendations, and eventually integrations with wearables and law-enforcement/government dashboards.

**USP (as positioned by the project):** Combining *reactive* emergency response (SOS, live location) with *preventive* intelligence (community reports + AI risk scoring) in a single app that degrades gracefully offline. Today, only the reactive half exists in code.

**Future Roadmap:** See [Section 18](#18-next-development-roadmap) and `ROADMAP.md` for the prioritized, file-level plan.

---

## 2. COMPLETE TECH STACK

| Technology | Why chosen | Current implementation status | Future usage |
|---|---|---|---|
| **Flutter** | Single codebase for Android/iOS (plus desktop/web scaffolding present but unused) with fast UI iteration — ideal for a hackathon timeline. | Fully in use. App entry point `lib/main.dart`, SDK constraint `^3.11.5` (Dart), Flutter `>=3.38.0` (from `pubspec.lock`). | Continue as the sole client framework; add state management and modularized screens as the app grows. |
| **Dart** | Required language for Flutter. | Used in all 3 `lib/` files. No null-safety issues found; modern Dart (3.x) syntax used. | Same. |
| **Android Studio** | Referenced in README as the primary IDE for Android builds/emulation. | Not verifiable from source (no `.idea/` committed — correctly gitignored), but Android project scaffolding (`android/`) is fully generated and Gradle Kotlin DSL (`.kts`) is in place. | Continue for Android builds/signing. |
| **VS Code** | Referenced in README as secondary/lightweight editor. | Same — not verifiable from source, no impact on runtime. | No change expected. |
| **Google Maps (`google_maps_flutter`)** | Industry-standard maps SDK with good Flutter plugin support; needed for the "Safety Map" feature. | **Implemented.** `lib/map_screen.dart` renders a `GoogleMap` widget centered on the user's current position, with `myLocationEnabled`/`myLocationButtonEnabled`. No markers, polylines, heatmap, or route logic yet. | Add markers for reported unsafe zones, heatmap overlay (see [Section 11](#11-ai--ml-plan)), and safe-route polylines. |
| **Geolocator** | De-facto standard Flutter plugin for cross-platform GPS access and permission handling. | **Implemented.** Used in both `main.dart` (`sendSOS()`) and `map_screen.dart` (`getLocation()`) to check/request permission and fetch `Position`. | Add continuous location streaming (`getPositionStream`) for live-tracking/guardian-sharing feature. |
| **Firebase (`firebase_core`, `cloud_firestore`)** | Chosen as the planned backend-as-a-service for auth, real-time data (community reports), and offline-capable sync. | **Declared as a dependency only — NOT wired up.** No `Firebase.initializeApp()` call anywhere in the code, no `google-services.json` / `GoogleService-Info.plist` present, no Firestore reads/writes exist. The app will not crash without it only because it's never initialized or called. | Core piece of the planned cloud architecture — see [Section 9](#9-firebase-plan). |
| **Hive** | Planned offline-first local database (referenced extensively in README). | **Not a dependency.** Not present in `pubspec.yaml` or `pubspec.lock`. Zero code exists for it. | Planned local cache for emergency contacts, pending reports, and offline SOS queueing — see [Section 10](#10-hive-database-plan). |
| **Python** | Planned language for the ML/risk-prediction backend. | **Not present anywhere in the repository.** No `.py` files, no `requirements.txt`, no separate backend folder. | Planned for the risk-scoring service — see [Section 11](#11-ai--ml-plan). |
| **Flask** | Planned lightweight API framework to serve the ML model. | **Not present.** No backend project exists in this repo at all. | Planned. |
| **Scikit-learn** | Planned ML library for the risk-prediction model. | **Not present.** | Planned. |
| **Pandas** | Planned for preprocessing community-report data before model training. | **Not present.** | Planned. |
| **Native Android SMS** | Cheapest, no-backend way to send an SOS message with a location link without needing a paid SMS gateway. | **Implemented**, via `url_launcher` opening an `sms:` URI (not a true native platform channel — see note below). | May be replaced/augmented by Twilio for delivery guarantees and to avoid relying on the user's own SMS app/plan. |
| **Git** | Version control. | **Not currently initialized** in this working directory (`git status` fails — no `.git` folder), even though a `.gitignore` exists. | Should be initialized before any further collaborative work. |
| **GitHub** | Hosting/collaboration, referenced by README ("publicly available... for hackathon evaluation"). | Cannot be verified locally (no `.git`, no remote config). | N/A until git is initialized. |
| **Antigravity SDK** | Named in the requested analysis template. | **Not found anywhere in the project** — no reference in `pubspec.yaml`, `pubspec.lock`, source, or config. | Not part of this project; likely included in the analysis template by default. Flag to the user if this was expected to exist. |

**Important correction of a common misconception:** the SMS feature is **not** a native Android SMS API integration. It uses `url_launcher` to open an `sms:` deep link with a prefilled body via `Uri(scheme: 'sms', ...)`. This opens the user's default SMS app for them to manually hit send — it does **not** send a message programmatically/silently, and it will not work headlessly (e.g., cannot trigger from a background service without UI).

---

## 3. DEPENDENCIES

Full breakdown in `DEPENDENCIES.md`. Summary of direct dependencies from `pubspec.yaml` (resolved versions per `pubspec.lock`):

| Package | Declared | Locked | Purpose | Used in code? |
|---|---|---|---|---|
| `flutter` (sdk) | sdk | 0.0.0 (sdk) | Framework | Yes |
| `google_maps_flutter` | ^2.5.0 | 2.17.0 | Map rendering | Yes — `map_screen.dart` |
| `geolocator` | ^10.0.0 | 10.1.1 | GPS location | Yes — `main.dart`, `map_screen.dart` |
| `url_launcher` | ^6.2.5 | 6.3.2 | Open `sms:` URI for SOS | Yes — `main.dart` |
| `firebase_core` | ^2.0.0 | 2.32.0 | Firebase bootstrap | **No** — declared, never initialized |
| `cloud_firestore` | ^4.0.0 | 4.17.5 | Cloud DB | **No** — declared, never used |
| `cupertino_icons` | ^1.0.8 | 1.0.9 | iOS-style icon font | Not referenced (Material icons used throughout) |
| `flutter_lints` (dev) | ^6.0.0 | 6.0.0 | Static analysis rules | Yes — `analysis_options.yaml` |
| `flutter_test` (dev, sdk) | sdk | 0.0.0 | Testing | Yes — `test/widget_test.dart` (but test is broken, see [Section 15](#15-code-quality-review)) |

**Unused packages:** `firebase_core`, `cloud_firestore`, `cupertino_icons` — all present in `pubspec.yaml` but not imported/used anywhere in `lib/`. They still get resolved and bundled (increasing app size and dragging in ~10 transitive Firebase packages, see `pubspec.lock`), with zero functional benefit today.

**Deprecated/outdated packages:** None are deprecated, but several are meaningfully behind current majors:
- `geolocator: ^10.0.0` — current major is 13.x.
- `google_maps_flutter: ^2.5.0` — pinned low; locked resolves to 2.17.0, current is higher.
- `firebase_core: ^2.0.0` / `cloud_firestore: ^4.0.0` — both are two majors behind current (firebase_core is on 3.x, cloud_firestore on 5.x as of recent releases). If/when Firebase work actually starts, bump these first.

**Should be upgraded:** `geolocator`, `firebase_core`, `cloud_firestore` — low risk since none are used in a way that would hit breaking API changes yet (Firebase isn't even initialized).

---

## 4. PROJECT STRUCTURE

```
women_safety_app/
├── lib/                          ← ALL app logic lives here (only 3 files)
│   ├── main.dart                 ← App entry point, HomeScreen, LoginScreen, AuthState
│   ├── map_screen.dart           ← Google Map screen with live location
│   └── config.dart               ← Hardcoded Google Maps API key constant
├── android/                      ← Standard Flutter-generated Android project
│   ├── app/
│   │   ├── build.gradle.kts      ← App-level Gradle config (Kotlin DSL)
│   │   └── src/
│   │       ├── main/AndroidManifest.xml    ← Permissions, API key meta-data, MainActivity
│   │       ├── debug/AndroidManifest.xml   ← Adds INTERNET permission for dev tooling
│   │       └── profile/AndroidManifest.xml ← Same as debug
│   ├── build.gradle.kts          ← Root project Gradle config
│   ├── settings.gradle.kts       ← Plugin versions (AGP 8.11.1, Kotlin 2.2.20)
│   └── gradle.properties         ← JVM args, AndroidX flag
├── ios/                          ← Standard Flutter-generated iOS project (Runner), untouched/default
├── linux/, macos/, windows/, web/ ← Standard Flutter multi-platform scaffolding, all default/untouched — the app is Android/iOS-focused in practice (Maps + Geolocator + SMS URI only make sense on mobile)
├── test/
│   └── widget_test.dart          ← Default Flutter counter-app test — **stale, does not test this app, and will fail** (see Section 15)
├── assets/                       ← Referenced in comments in pubspec.yaml but the folder does not exist and no assets are declared
├── pubspec.yaml                  ← Dependency manifest
├── pubspec.lock                  ← Resolved dependency versions
├── analysis_options.yaml         ← Default `flutter_lints` config, no custom rules
├── .gitignore                    ← Standard Flutter gitignore (present, but no `.git` directory exists)
├── LICENSE                       ← Custom "All Rights Reserved" license (hackathon/portfolio viewing only)
└── README.md update              ← Project README (note: filename literally contains a space — "README.md update", not "README.md")
```

### Dart file-by-file breakdown

**`lib/main.dart`** (888 lines — the entire app logic besides the map)
- `AuthState`: a static, **in-memory only** class holding a `Map<String, Map<String,String>>` of registered users, plus `loggedInUser`/`loggedInName`. No persistence — all accounts are lost on app restart. Passwords stored in plaintext in memory.
- `SafetyApp`: root `MaterialApp`, dark theme with a red/maroon safety color scheme, routes to `HomeScreen`.
- `HomeScreen` (`StatefulWidget`): the main screen. Contains:
  - `sendSOS()` — gets GPS position via `geolocator`, builds a `sms:` URI with a Google Maps link, opens it via `url_launcher`. Hardcoded recipient number `'7755922469'` (marked with a `// Replace with your phone number` comment — this is a placeholder, not a real "emergency contact" system).
  - The 150×150 circular SOS button — tap triggers `sendSOS()`, long-press navigates to `MapScreen`.
  - An instructional card explaining how SOS works.
  - Login/logout UI state driven by `AuthState`.
  - Four feature tiles (Live Location Tracking, Emergency Contacts, Safety Map, Fake Call) — only "Safety Map" actually navigates anywhere; the other three show a "coming soon" snackbar via `_onLockedFeatureTap`.
- `LoginScreen` (`StatefulWidget`): tabbed sign-in/register UI operating purely against the in-memory `AuthState`. No network calls, no validation beyond non-empty fields and a 6-character password minimum.
- `_AuthCard`: small stateless widget wrapping a button that pushes `LoginScreen`.
- Imports: `flutter/material.dart`, `geolocator`, `url_launcher`, local `map_screen.dart`.

**`lib/map_screen.dart`** (65 lines)
- `MapScreen` (`StatefulWidget`) → `_MapScreenState`.
- `getLocation()`: checks location service enabled, checks/requests permission, fetches current `Position`, stores as `LatLng` in state.
- `build()`: shows a spinner until location resolves, then renders `GoogleMap` centered on the user with the native "my location" button enabled. No markers, no other overlays.
- Imports: `flutter/material.dart`, `google_maps_flutter`, `geolocator`, local `config.dart` (imported but `GOOGLE_MAPS_API_KEY` constant is **not actually referenced** in this file — the real API key wiring happens at the native layer via `AndroidManifest.xml` meta-data, not through this Dart constant).

**`lib/config.dart`** (1 line)
- Declares `const String GOOGLE_MAPS_API_KEY = "AIzaSyAz6mCNHHo6B2nTpcYJHOZbr-CkkDdQ86w";`
- **This is a live-looking Google Maps API key committed in plaintext**, and it is *also* duplicated in `android/app/src/main/AndroidManifest.xml`. See [Section 16](#16-security-review) — this is the single most important finding in this analysis.
- Not imported/used by any consuming code path today (dead constant) — the Android manifest meta-data is what Google Maps actually reads on Android.

### Relationship diagram

```
main.dart
  ├─ imports geolocator, url_launcher  →  sendSOS()
  └─ imports map_screen.dart           →  navigates to MapScreen (tap-long-press or "Safety Map" tile)

map_screen.dart
  ├─ imports google_maps_flutter, geolocator
  └─ imports config.dart               →  (imported but unused — dead import)
```

---

## 5. CURRENT FEATURES

| Feature | How it actually works |
|---|---|
| **One-tap SOS** | `sendSOS()` in `main.dart` gets current GPS coordinates via `Geolocator`, builds an `https://maps.google.com/?q=lat,lng` link inside a message string, and opens the device's SMS app pre-filled via an `sms:` URI (`url_launcher`). The user must manually tap "send" in their SMS app — nothing is sent automatically. Recipient is a single hardcoded number. Works without login (by design, per README/UI copy). |
| **Google Maps integration** | `MapScreen` shows a `GoogleMap` widget centered on the user's live position with the native blue-dot location indicator and re-center button. Reached via long-press on the SOS button, or the "Safety Map" tile (only when logged in). |
| **Live GPS location fetch** | `Geolocator.getCurrentPosition()` — a one-shot fetch, not a continuous stream. Used identically in both `main.dart` and `map_screen.dart`. |
| **Runtime permission handling** | Both `sendSOS()` and `getLocation()` check `Geolocator.checkPermission()`, call `requestPermission()` if denied, and bail out gracefully (with a `print` log, not a user-facing UI error) if permanently denied. |
| **In-memory login/registration** | `AuthState` (static class) stores users in a `Map` for the lifetime of the app process only. `LoginScreen` provides a tabbed Sign In / Register UI. No backend, no persistence — a fresh app launch has zero accounts. |
| **Feature gating by login state** | `HomeScreen` checks `AuthState.loggedInUser`; unauthenticated users see locked feature tiles with a "Login to use X" snackbar. Only "Safety Map" is actually functional when unlocked — "Live Location Tracking," "Emergency Contacts," and "Fake Call" show a "coming soon" snackbar regardless of login state. |
| **UI/Navigation** | Standard `Navigator.push`/`pop` between `HomeScreen` and `LoginScreen`/`MapScreen`. No named routes, no state management library — everything is local `setState()`. |
| **Theming** | Single dark theme (deep maroon/red palette) defined inline in `SafetyApp`. No light theme, no theme toggle. |

**Not implemented despite being listed as "Current Features" in the README:** "Trusted contacts support" (the feature tile exists but is a "coming soon" stub) and "Community-based unsafe area reporting" (mentioned in the README's overview but has zero code).

---

## 6. FUTURE FEATURES

All of the following are **planned only** — confirmed to have zero corresponding code, dependencies, or config in this repository:

- Hive offline database / offline-first local caching
- Firebase Firestore data layer (dependency exists, wiring does not)
- Firebase Authentication (real login/registration)
- Offline → online data synchronization
- Community safety heatmap
- AI/ML-based risk prediction (Python/Flask/Scikit-learn/Pandas — no backend project exists at all)
- Safe route recommendation
- Incident reporting with photo/media attachments
- Community validation/voting on reports
- High-risk zone push notifications
- Analytics dashboard
- Voice-activated SOS
- Fake call feature (UI tile exists, logic does not)
- Smartwatch/wearable integration
- Police/government dashboard integration
- Twilio-based SMS delivery (to replace the manual `sms:` URI approach)
- Real emergency-contacts management (add/edit/remove trusted contacts — currently just a locked, non-functional tile)

---

## 7. GOOGLE MAPS IMPLEMENTATION

- **API usage:** `google_maps_flutter: ^2.5.0` (locked at 2.17.0) renders a single `GoogleMap` widget in `map_screen.dart`. No markers, polylines, circles, or custom styling are used — it is the default map with the native "my location" layer enabled.
- **Permissions:** `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION` declared in `android/app/src/main/AndroidManifest.xml`. No background location permission (not needed for current one-shot usage).
- **AndroidManifest changes:** A `<meta-data android:name="com.google.android.geo.API_KEY" .../>` tag supplies the key that the native Google Maps SDK reads directly — this is the actual mechanism that makes maps render on Android, independent of `lib/config.dart`.
- **API key configuration:** The key is hardcoded in **two places**: `android/app/src/main/AndroidManifest.xml` and `lib/config.dart`. Both contain the same literal string (`AIzaSyAz6mCNHHo6B2nTpcYJHOZbr-CkkDdQ86w`). Neither is gitignored, environment-variable-driven, or restricted via a `--dart-define` / `.env` mechanism. **This is a committed secret** — see [Section 16](#16-security-review).
- **iOS:** No equivalent `GMSServices.provideAPIKey(...)` call exists in `ios/Runner/AppDelegate.swift` — the app **will not render Google Maps on iOS** in its current state. This is a functional gap, not just a security one.
- **Limitations:** No marker clustering, no custom map styling (e.g., dark-mode map style to match the app's dark theme), no offline map tiles, no route/heatmap layers, no iOS key wiring.
- **Future improvements:** Add the iOS API key wiring in `AppDelegate.swift`, move both keys to a non-committed secrets mechanism, add markers for unsafe zones once community reporting exists, add a dark-styled map JSON to match the app theme.

---

## 8. ANDROID CONFIGURATION

**`AndroidManifest.xml` (main):**
- Permissions: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`. Notably **no `INTERNET` permission** is declared in the main manifest — only the `debug` and `profile` manifest variants add it (auto-injected by Flutter tooling for hot-reload/DevTools). **In a release build, the app will lack the INTERNET permission**, which will break Google Maps tile loading and any future Firestore/network calls. This is a real functional bug waiting to surface at release-build time.
- `application`: `android:label="women_safety_app"`, icon from `mipmap/ic_launcher` (default Flutter icon, not customized), Maps API key meta-data, `flutterEmbedding=2`.
- `MainActivity`: standard Flutter `singleTop` activity, `exported="true"` (required since it's the launcher activity on API 31+), hardware-accelerated, no unusual `intent-filter`s beyond the launcher.
- `<queries>` block for `PROCESS_TEXT` — default Flutter boilerplate.

**`android/app/build.gradle.kts`:**
- `namespace`/`applicationId` = `com.example.women_safety_app` — **still the default placeholder package name**, marked with a `// TODO: Specify your own unique Application ID` comment. Must be changed before any real Play Store submission.
- `compileSdk`/`minSdk`/`targetSdk`/`versionCode`/`versionName` all pulled from the Flutter tool (`flutter.*`), not hardcoded — reasonable default.
- Java/Kotlin target: **Java 17**.
- Release build type **signs with the debug keystore** (`signingConfig = signingConfigs.getByName("debug")`), explicitly marked with a `// TODO: Add your own signing config`. Fine for local testing/hackathon builds, **not acceptable for any real release**.

**`android/build.gradle.kts`:** Standard root project — `google()`/`mavenCentral()` repos, custom build-dir redirection (Flutter default), nothing unusual.

**`android/settings.gradle.kts`:** Plugin versions — Android Gradle Plugin `8.11.1`, Kotlin `2.2.20`. Both are recent/current-generation versions.

**`android/gradle.properties`:** `org.gradle.jvmargs=-Xmx8G ...` (generous heap for the build daemon), `android.useAndroidX=true`. Nothing unusual.

**`android/local.properties`:** Not present in the file listing (correctly gitignored — it contains machine-local SDK paths and would not be portable/committed anyway).

**Potential improvements:**
1. Add `INTERNET` permission to the main manifest (currently only in debug/profile).
2. Change `applicationId`/`namespace` away from the `com.example.*` placeholder.
3. Add a real release signing config (keystore + `key.properties`, gitignored).
4. Replace the default launcher icon with a branded one.
5. Add iOS Maps API key wiring for feature parity.

---

## 9. FIREBASE PLAN

**Status: dependencies declared, zero implementation.** `firebase_core` and `cloud_firestore` are in `pubspec.yaml`, but there is no `Firebase.initializeApp()` call, no `firebase_options.dart` (the file the FlutterFire CLI normally generates), no `google-services.json` in `android/app/`, and no `GoogleService-Info.plist` in `ios/Runner/`. **The app cannot currently talk to Firebase at all** — adding a Firestore call today would throw at runtime since Firebase is never initialized.

**Suggested minimal path to make Firebase real:**
1. Run `flutterfire configure` to generate `firebase_options.dart` and register the Android/iOS apps in a Firebase project — this drops the required `google-services.json`/`GoogleService-Info.plist` in place automatically.
2. Add `await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform)` at the top of `main()` before `runApp()`.
3. Replace the in-memory `AuthState` with **Firebase Authentication** (phone-auth fits naturally, since the app already collects a phone number for login).

**Suggested Firestore schema (planned, not implemented):**
```
users/{uid}
  name, phone, createdAt
  emergencyContacts: [ { name, phone } ]

sosEvents/{eventId}
  uid, timestamp, lat, lng, status (sent/acknowledged)

incidentReports/{reportId}
  uid, timestamp, lat, lng, category, description, mediaUrls[], upvotes, verified

riskZones/{zoneId}          # written by the future ML pipeline, read-only from the client
  lat, lng, radius, riskScore, lastUpdated
```

**Cloud Functions (planned):** Trigger on new `incidentReports` writes to recompute nearby `riskZones` scores (or, more likely, this is done by the planned Flask service — see [Section 11](#11-ai--ml-plan) — with Functions used only for lighter tasks like notification fan-out).

**Offline Sync:** Firestore has built-in offline persistence that could be enabled with a single flag (`FirebaseFirestore.instance.settings = Settings(persistenceEnabled: true)`) once Firestore is actually wired up — this may reduce the perceived need for a separate Hive layer for *cloud-mirrored* data, though Hive would still be useful for purely local state (see next section).

---

## 10. HIVE DATABASE PLAN

**Status: not a dependency, zero code.** Hive is mentioned extensively in the README as the offline-first storage layer but is absent from `pubspec.yaml`.

**Suggested plan when this work starts:**
- Add `hive`, `hive_flutter`, and `hive_generator`/`build_runner` (dev) to `pubspec.yaml`.
- Boxes:
  - `contactsBox` — locally cached emergency contacts (works even fully offline).
  - `pendingSosBox` — queue of SOS events created while offline, flushed to Firestore once connectivity returns.
  - `pendingReportsBox` — same pattern for incident reports created offline.
  - `sessionBox` — persisted login/session token, replacing the current in-memory-only `AuthState` (today, logging out is the *only* option after any app restart, since state is lost).
- Models: `EmergencyContact`, `PendingSosEvent`, `PendingReport` as `@HiveType` classes with generated adapters.
- Sync strategy: on connectivity restore (e.g., via `connectivity_plus`, itself another dependency to add), iterate pending boxes, push to Firestore, clear on success.

---

## 11. AI / ML PLAN

**Status: entirely aspirational — no Python files, no `requirements.txt`, no backend directory, no model artifacts exist anywhere in this repository.**

Planned pipeline (as described in the README and requested template):

```
User incident reports (Firestore)
        ↓
Pandas preprocessing (clean, geocode-bucket, time-bucket)
        ↓
Feature engineering (time-of-day, report density, historical frequency per grid cell)
        ↓
Scikit-learn model (likely a simple classifier/regressor — e.g., RandomForest or gradient boosting — given the tabular, low-volume nature of hackathon-scale incident data)
        ↓
Risk score per geographic grid cell
        ↓
Written back to Firestore (riskZones collection)
        ↓
Flutter reads riskZones and renders as a heatmap overlay on MapScreen
```

**Training dataset:** None exists yet. Would need to be bootstrapped from either synthetic data or a public crime/safety dataset before any real community reports accumulate (cold-start problem).

**Model choice:** Not decided in any project artifact. A simple, explainable model (logistic regression or a shallow tree ensemble) is the pragmatic hackathon-scale choice over deep learning, given the tabular size of the expected report volume.

**Deployment:** Planned as a Flask API (per README tech stack) — no scaffolding exists. Would need its own repo/folder, a `requirements.txt`, and a hosting decision (not specified anywhere).

**API:** Not designed. Flutter would need an HTTP client call (e.g., via `http` or `dio`, neither currently a dependency) to either the Flask service directly, or simply read the precomputed `riskZones` collection from Firestore (avoiding a live model-serving dependency in the mobile critical path — recommended).

---

## 12. APPLICATION ARCHITECTURE

**Current architecture (what actually runs today):**

```
Flutter Mobile App (Android only — iOS Maps key missing)
        │
        ├── AuthState (static, in-memory, process-lifetime only)
        │
        ├── HomeScreen ── sendSOS() ── Geolocator (GPS) ── url_launcher ── sms: URI ── device SMS app (manual send, hardcoded number)
        │
        └── MapScreen ── Geolocator (GPS) ── google_maps_flutter ── Google Maps SDK (Android key via AndroidManifest meta-data)
```

There is **no backend, no network layer, no persistence layer** in the current architecture. Every "service" the app talks to is either a device-local API (Geolocator, the SMS app) or the Google Maps SDK.

**Future architecture (planned, per README + this analysis):**

```
Flutter Client
   │
   ├── Firebase Auth  ──  real user identity (replaces in-memory AuthState)
   │
   ├── Hive (local)  ──  offline queue + cache  ──┐
   │                                                 │ sync on reconnect
   ├── Firestore (cloud)  ←──────────────────────────┘
   │        │
   │        ├── incidentReports  ──→  Flask/Pandas/Scikit-learn service  ──→  riskZones (written back to Firestore)
   │        │
   │        └── riskZones  ──→  rendered as heatmap on MapScreen
   │
   └── Google Maps SDK  ──  base map + heatmap + future safe-route polylines
```

**Data flow — offline:** SOS button still works (Geolocator + SMS URI don't need network). Any new "report" or contact edit would be written to a Hive box instead of Firestore, marked pending.

**Data flow — online:** Pending Hive entries sync to Firestore; app can read `riskZones` and community reports live.

**Synchronization:** Not implemented; would require a connectivity listener plus a queue-flush routine as described in [Section 10](#10-hive-database-plan).

---

## 13. API INVENTORY

| API | Purpose | Implementation | Status |
|---|---|---|---|
| Google Maps SDK (Android) | Render interactive map | `google_maps_flutter` + AndroidManifest meta-data key | **Live, Android only** |
| Google Maps SDK (iOS) | Same, for iOS | Not wired (`GMSServices.provideAPIKey` missing) | **Not implemented — will not render on iOS** |
| Geolocator (device GPS) | Fetch current position, manage permissions | `Geolocator.getCurrentPosition()`, `checkPermission()`, `requestPermission()` | **Live** |
| `sms:` URI via `url_launcher` | Open SMS app pre-filled with SOS message | `Uri(scheme: 'sms', ...)` + `launchUrl()` | **Live**, but manual-send, single hardcoded recipient |
| Firebase Firestore | Cloud data store | Declared dependency, unused | **Not implemented** |
| Twilio | Reliable, automatic SMS delivery | None | **Planned, not started** |
| Weather API | Mentioned in template, not in README | None | **Not planned in project docs — no evidence this was ever scoped** |
| Crime dataset / risk API | Feed for the ML risk model | None | **Planned, not started** |

---

## 14. XML AND CONFIG FILES

| File | What it configures |
|---|---|
| `android/app/src/main/AndroidManifest.xml` | App permissions (fine/coarse location), Maps API key, launcher activity, `flutterEmbedding` version. Missing `INTERNET` in the main variant (see [Section 8](#8-android-configuration)). |
| `android/app/src/debug/AndroidManifest.xml` & `.../profile/AndroidManifest.xml` | Add `INTERNET` permission for Flutter's dev tooling (hot reload/DevTools) — auto-generated, not meant to be hand-edited. |
| `android/app/src/main/res/values/styles.xml` & `values-night/styles.xml` | Default Flutter `LaunchTheme`/`NormalTheme` styles — untouched from `flutter create` defaults. |
| `android/app/src/main/res/drawable*/launch_background.xml` | Default splash-screen background — untouched. |
| `android/app/build.gradle.kts` | App-level build config: namespace/applicationId (still default), SDK versions (delegated to Flutter), Java 17, debug-signed release build. |
| `android/build.gradle.kts` | Root Gradle config — repos and build-dir redirection, standard Flutter defaults. |
| `android/settings.gradle.kts` | Declares AGP 8.11.1 and Kotlin 2.2.20 plugin versions, includes the `:app` module. |
| `android/gradle.properties` | JVM heap args for the Gradle daemon, AndroxX flag. |
| `android/gradle/wrapper/gradle-wrapper.properties` | Pins the Gradle wrapper version used to build. |
| `ios/Runner/Info.plist` | Standard iOS app config — **no location-usage description strings were inspected/added for Maps/Geolocator**, which would be required (`NSLocationWhenInUseUsageDescription`) for the app to request location permission on iOS at all. This is a functional gap. |
| `web/manifest.json`, `web/index.html` | Default Flutter web scaffolding — unused given the app's mobile-only feature set. |
| `analysis_options.yaml` | Enables `package:flutter_lints/flutter.yaml` with zero customization. |
| `pubspec.yaml` / `pubspec.lock` | Dependency manifest and resolved lockfile — see [Section 3](#3-dependencies). |
| `.gitignore` | Standard Flutter-generated ignore rules (build artifacts, `.dart_tool/`, IDE files). Notably **does not ignore `lib/config.dart`**, which is how the API key ended up committed in plaintext. |

---

## 15. CODE QUALITY REVIEW

- **Broken test suite:** `test/widget_test.dart` is the unmodified Flutter counter-app template — it calls `MyApp()` (a class that doesn't exist; the real root widget is `SafetyApp`) and asserts on counter text (`'0'`, `'1'`) that doesn't exist in this app. **`flutter test` will fail to compile.** This is the single most actionable code-quality fix.
- **Dead code / unused imports:** `config.dart` is imported in `map_screen.dart` but its `GOOGLE_MAPS_API_KEY` constant is never referenced (the Android manifest meta-data is what actually supplies the key at runtime). `cupertino_icons`, `firebase_core`, `cloud_firestore` are unused dependencies (see [Section 3](#3-dependencies)).
- **Hardcoded values:** SOS recipient phone number (`'7755922469'`) is hardcoded directly in `sendSOS()` rather than sourced from user-managed emergency contacts — this directly undercuts the "Emergency Contacts" feature tile, which is otherwise just a locked stub.
- **In-memory auth is a functional dead end:** `AuthState` cannot survive an app restart; every "registered" user disappears. This is fine for a demo but should not be extended further (e.g., don't bolt more features onto it) — the next auth work should go straight to Firebase Auth rather than deepening the in-memory model.
- **Plaintext password storage:** Even though it's in-memory only, `AuthState._users` stores raw passwords with no hashing — worth fixing at the same time real auth is introduced, so the habit doesn't carry forward.
- **Large widget/build methods:** `HomeScreen.build()` and `LoginScreen.build()` are both large, deeply nested single methods (150+ lines each) mixing layout, styling, and business logic inline. They're already partially decomposed into helper methods (`_instructionStep`, `_featureTile`, `_tab`, `_field`), which is good practice — but each `Screen` doing everything itself (no separate widget files) will get harder to maintain as more real feature screens are added for the currently-stubbed tiles.
- **No state management library:** Fine at this scale (2 screens), but the "coming soon" feature tiles (Live Location Tracking, Emergency Contacts, Fake Call) will need real state once implemented — worth choosing a pattern (Provider/Riverpod, or continue with plain `setState`/`InheritedWidget`) before that work starts rather than mid-way through.
- **`print()` used for error logging:** In `sendSOS()`'s `catch` block and the permanently-denied-permission paths — fine for a hackathon demo, but silent from the user's perspective (a failed SOS send shows no UI feedback at all, which is a real UX/safety concern for this specific app).
- **Unused assets:** No `assets/` folder exists and none is declared in `pubspec.yaml` — nothing to clean up here, but also nothing to brand the app with (default Flutter launcher icon is still in use).
- **Filename issue:** The README file is literally named `README.md update` (with a space, not `README.md`) — GitHub and most tooling will not render this as the repository's landing README. This should be renamed (not done here, per the "no code changes" instruction for this task).

---

## 16. SECURITY REVIEW

See `SECURITY.md` for the full standalone writeup. Headline findings:

1. **🔴 Critical — Google Maps API key committed in plaintext, in two places.** `lib/config.dart` and `android/app/src/main/AndroidManifest.xml` both contain the literal key `AIzaSyAz6mCNHHo6B2nTpcYJHOZbr-CkkDdQ86w`. Since there is no `.git` history to have already leaked it further, **this is the single highest-priority fix**: rotate the key in Google Cloud Console, apply API restrictions (Android app restriction by package name + SHA-1, and restrict to only the Maps SDK for Android), and stop committing it going forward (`--dart-define` at build time, or a gitignored `secrets.dart`/`.env`).
2. **🟠 High — Hardcoded SOS recipient number.** The emergency contact is a single hardcoded phone number baked into source (`'7755922469'`) rather than configurable per-user. Not a classic "vulnerability," but a serious functional-safety defect for an app whose entire purpose is emergency contact — every install currently texts the *same* number regardless of the actual user's intended contact.
3. **🟡 Medium — Plaintext password storage (in-memory).** `AuthState` stores registered users' passwords unhashed. Low real-world exposure today (process-memory only, no persistence/network), but should not be the pattern that migrates into a persisted or Firebase-backed auth system.
4. **🟡 Medium — No real authentication.** The login/registration screens give the *appearance* of an account system with zero backing security — anyone can "register" any phone number with any password, and it proves nothing since it's never checked against a real identity provider. Should not be presented to users/judges as a secure account system.
5. **🟢 Low — Missing `INTERNET` permission in the main Android manifest.** Not a security issue, but will cause silent network failures (Maps tiles, future Firestore calls) in release builds since only the `debug`/`profile` manifest variants currently declare it.
6. **🟢 Low — `.gitignore` is a standard Flutter template and does not specifically protect secret files.** Since `lib/config.dart` holds a secret, either the file should be added to `.gitignore` and loaded via a non-committed mechanism, or the key inside it should be restricted tightly enough that committing it is an acceptable risk (still not recommended).
7. **🟢 Low — No `.env`/secrets convention established.** There is no existing pattern in the repo for keeping *any* secret out of source control, so this should be set up now, before Firebase service-account keys or a Flask API key are added later.
8. **Debug build signing:** Release builds are signed with the debug keystore. Not a vulnerability for a hackathon build, but must not ship this way to any real distribution channel — anyone with the (publicly known) Android debug keystore could resign/republish an app claiming to be this one.

No secrets scanning tooling, no CI/CD, and no `.git` history were present to inspect further — this review is based entirely on the current working tree.

---

## 17. HACKATHON READINESS

**Current MVP:** A working SOS button (opens SMS with GPS link) + a live map screen + a cosmetic login flow. This demos well as a 2-minute walkthrough: open app → show "You are Safe" state → tap SOS → show the pre-filled SMS with a live Google Maps link → long-press to show the live map.

**Implemented features that are demo-safe:** SOS message composition, live GPS fetch, Google Maps rendering (Android), permission handling, dark-themed UI, login/register UI (as a *visual* flow only — don't claim it's a real backend).

**Future features to mention as roadmap, not claim as built:** Firebase/Hive sync, community reports, AI risk heatmap, safe routes — all clearly labeled "planned" in the README already, which is good practice; keep that framing in any pitch.

**Presentation readiness / demo flow suggestion:**
1. Show the home screen and "You are Safe" state.
2. Tap SOS → show the SMS app opening with a real, live Google-Maps link (works because the demo device has real GPS + a working API key — **make sure the key hasn't been rotated/restricted in a way that breaks the demo right before presenting**, if [Section 16](#16-security-review)'s fix is applied beforehand).
3. Long-press SOS (or use the Safety Map tile after logging in) → show the live map with blue-dot location.
4. Walk through the locked feature tiles as the "vision" — Live Location Tracking, Emergency Contacts, Fake Call — and pivot to the roadmap slide (Firebase, Hive, AI risk heatmap).

**Likely judge questions and honest answers:**
- *"Does the SOS actually send automatically?"* — No, it opens the SMS app pre-filled; the user must tap send. Be upfront about this rather than letting a judge discover it live.
- *"Is this data stored anywhere / does the app work offline?"* — Not yet; Hive/Firebase are planned but not implemented. The SOS and Map features themselves work fine offline-for-GPS, online-for-maps-tiles.
- *"How do you add emergency contacts?"* — You don't yet; it's a locked/stub tile. Be ready to say this is next on the roadmap rather than improvising a feature that isn't there.
- *"Is my login secure?"* — No; be transparent that auth is currently a UI-only demo pending Firebase Auth integration.
- *"Does this work on iPhone?"* — Not fully — the Google Maps iOS key isn't wired up yet, so the map screen would fail to render on iOS today.

**Weaknesses:** No backend, no real persistence, no real auth, single hardcoded emergency contact, no iOS map support, broken default test file, committed API key.

**Strengths:** Clean, cohesive dark UI; the core SOS flow that *is* built actually works end-to-end on Android; honest README that already separates "current" vs "planned" features; sensible, incrementally buildable roadmap toward the stated vision.

---

## 18. NEXT DEVELOPMENT ROADMAP

Full detail in `ROADMAP.md`. Summary:

| Priority | Task | Complexity | Depends on | Files touched |
|---|---|---|---|---|
| **P1** | Rotate & restrict the committed Google Maps API key; stop committing secrets | Low | Google Cloud Console access | `lib/config.dart`, `android/.../AndroidManifest.xml`, `.gitignore` |
| **P1** | Fix `test/widget_test.dart` (currently fails to compile) | Low | None | `test/widget_test.dart` |
| **P1** | Add `INTERNET` permission to main `AndroidManifest.xml` | Low | None | `android/app/src/main/AndroidManifest.xml` |
| **P2** | Wire up iOS Google Maps key + `NSLocationWhenInUseUsageDescription` | Low–Medium | Apple dev/Maps key | `ios/Runner/AppDelegate.swift`, `ios/Runner/Info.plist` |
| **P2** | Replace hardcoded SOS number with real, user-managed Emergency Contacts | Medium | Local storage decision (Hive vs simple `shared_preferences` first) | `lib/main.dart`, new `lib/models/`, `lib/screens/contacts_screen.dart` |
| **P3** | Initialize Firebase (`flutterfire configure`) + migrate `AuthState` to Firebase Auth | Medium–High | Firebase project setup | `lib/main.dart`, new `firebase_options.dart`, `android/app/google-services.json` |
| **P3** | Add Hive for offline contact/report caching + SOS queueing | Medium | Firebase in place (for sync target) | `pubspec.yaml`, new `lib/local/` boxes/models |
| **P4** | Community incident reporting (Firestore-backed) + map markers | Medium–High | Firebase | `lib/screens/report_screen.dart`, `lib/map_screen.dart` |
| **P4** | Risk heatmap MVP (even a naive report-density heatmap, pre-ML) | Medium | Community reports existing | `lib/map_screen.dart` |
| **P5** | Python/Flask/Scikit-learn risk-scoring service | High | Real report volume/dataset | New separate repo/folder — out of scope for this Flutter project directory |
| **P5** | Production release signing + branded app icon + real `applicationId` | Low–Medium | None (can happen anytime before release) | `android/app/build.gradle.kts`, `android/app/key.properties` (new, gitignored) |

**Potential issues to watch across the roadmap:** the cold-start problem for the ML model (no data until community reporting has real usage); the manual-send nature of the SMS SOS flow may need a UX rethink (or a Twilio-based automatic send) before this is presented as a serious emergency tool; iOS parity work has been fully deferred so far and will take real effort to catch up.

---

## 19. PROJECT MEMORY

*(Condensed for fast onboarding of future sessions — read this section first if context is limited.)*

- **What this is:** A Flutter hackathon-stage prototype for a women's safety app. Core working feature: SOS button → GPS location → pre-filled SMS (manual send). Secondary feature: a live Google Map screen (Android-only right now).
- **What it is NOT (yet):** No backend, no Firebase wiring (despite being a dependency), no Hive, no Python/ML anything, no real authentication, no persistence of any kind. Everything beyond the SOS + Map is either a locked "coming soon" UI stub or pure README aspiration.
- **Codebase size:** Just 3 Dart files in `lib/` — `main.dart` (all UI + auth + SOS logic), `map_screen.dart` (map screen), `config.dart` (one hardcoded API key constant, effectively dead code since the Android manifest is what actually supplies the key).
- **The most urgent real issue:** a live-looking Google Maps API key is committed in plaintext in two files. Rotate/restrict it before doing anything else security-sensitive with this repo.
- **The most urgent code-health issue:** `test/widget_test.dart` is the unedited Flutter template and does not compile against this app — `flutter test` currently fails outright.
- **Architecture:** No layering yet — screens directly call `Geolocator`/`url_launcher`/`google_maps_flutter` inline. No state management library; plain `setState`. This is appropriate at the current size; introduce a pattern (Provider/Riverpod) only once the stubbed feature tiles start getting real implementations, to avoid premature abstraction.
- **Coding conventions observed:** Dark maroon/red theme with hex colors defined inline (`0xFFC0392B` primary, `0xFF1A0A0A` background) — no theme constants file exists yet, colors are repeated as literals throughout `main.dart`. Comments use decorative box-drawing separators (`// ════...`) around the two pieces of code explicitly marked "unchanged" (`sendSOS()` and the SOS button) — a signal from a prior contributor that these specific blocks should not be casually refactored without care, since they're flagged as intentionally frozen/working.
- **Folder structure:** Flat — everything in `lib/` directly, no `screens/`/`widgets/`/`models/`/`services/` subfolders yet. When adding the roadmap's next features, consider introducing that structure rather than continuing to grow `main.dart`.
- **Not a git repo currently** — no `.git` directory exists despite `.gitignore` being present. If asked to commit/version this work, it needs `git init` first (confirm with the user before doing so, since it's a meaningful state change).
- **Important decision already made by a prior contributor:** SOS works without login by design ("SOS is always active — no sign-in required in emergencies") — preserve this behavior in any future auth refactor; do not gate the SOS button behind Firebase Auth.
- **README is more aspirational than the code** — always verify a claimed feature against actual `lib/` source before relying on the README alone; this document (`PROJECT_CONTEXT.md`) reconciles the two and should be treated as the more accurate source going forward, updated as the gap closes.

---

## 20. OUTPUT — Companion Documents

This analysis produced the following files at the project root (all newly created; **no existing project files were modified**):

- `PROJECT_CONTEXT.md` — this file, the master reference.
- `PROJECT_ARCHITECTURE.md` — expanded architecture diagrams and data-flow detail.
- `TECH_STACK.md` — expanded per-technology deep dive.
- `ROADMAP.md` — full prioritized roadmap with complexity/dependencies/files/risks.
- `DEPENDENCIES.md` — full `pubspec.yaml`/`pubspec.lock` dependency table and audit.
- `SECURITY.md` — full security findings and remediation steps.
