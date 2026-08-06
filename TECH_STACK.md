# TECH_STACK.md — Women Safety App

Companion to `PROJECT_CONTEXT.md`. Deep dive on every technology named in the requested analysis scope, with an explicit **implemented vs. planned** flag for each.

---

## Client / Mobile

### Flutter — ✅ Implemented (core framework)
- **Why chosen:** Single Dart codebase targeting Android + iOS (with desktop/web scaffolding generated but unused in practice), fast hot-reload iteration — well suited to a hackathon build cadence.
- **Version:** SDK constraint `^3.11.5` in `pubspec.yaml`; `pubspec.lock` resolves Flutter `>=3.38.0`.
- **Current implementation:** Entire app — `SafetyApp` (root `MaterialApp`), `HomeScreen`, `LoginScreen`, `MapScreen`.
- **Future usage:** Remains the sole client framework. As stubbed features (Emergency Contacts, Fake Call, Live Location Tracking) get built out, expect the `lib/` folder to grow beyond 3 files — plan a `screens/`, `models/`, `services/` structure at that point.

### Dart — ✅ Implemented (language)
- **Why chosen:** Required by Flutter.
- **Current implementation:** Modern Dart 3.x syntax used throughout, no legacy pre-null-safety patterns observed.
- **Future usage:** Continue as-is; introduce `freezed`/`json_serializable` if/when Firestore model classes are added, to avoid hand-written (de)serialization boilerplate.

### Android Studio / VS Code — ⚪ Tooling (not verifiable from source)
- **Why chosen (per README):** Android Studio for Android-specific tooling (emulators, Gradle debugging), VS Code for lightweight day-to-day editing.
- **Current implementation status:** No IDE config files are committed (`.idea/` is correctly gitignored; no `.vscode/launch.json` present either). Cannot verify usage from the repo, but the fully-generated Android Gradle Kotlin DSL project structure is consistent with Android Studio-created scaffolding.
- **Future usage:** No change expected; this is a developer-preference layer, not a project dependency.

---

## Maps & Location

### Google Maps (`google_maps_flutter`) — ✅ Implemented (Android only)
- **Why chosen:** Most mature, best-documented Flutter maps plugin; matches the README's stated need for an "interactive Google Maps integration."
- **Current implementation:** `lib/map_screen.dart` renders a bare `GoogleMap` widget centered on the user's live position, `myLocationEnabled`/`myLocationButtonEnabled` on. No markers/overlays. API key supplied via `AndroidManifest.xml` meta-data (Android) — **iOS key wiring is missing** (`GMSServices.provideAPIKey` is not called anywhere in `ios/Runner/AppDelegate.swift`), so the map will not render on iOS today.
- **Future usage:** Markers for community-reported unsafe zones, a heatmap layer fed by the planned risk-scoring pipeline, safe-route polylines, and a custom dark map style to match the app's theme.

### Geolocator — ✅ Implemented
- **Why chosen:** De-facto standard cross-platform GPS/permission plugin for Flutter.
- **Current implementation:** `checkPermission()` / `requestPermission()` / `getCurrentPosition()` used identically in `sendSOS()` (`main.dart`) and `getLocation()` (`map_screen.dart`) — both one-shot fetches, not continuous streams.
- **Future usage:** `getPositionStream()` for continuous live-location sharing with guardians (currently a locked "coming soon" feature tile with zero logic behind it).

---

## Backend / Cloud (all planned, none implemented)

### Firebase (`firebase_core`, `cloud_firestore`) — 🟡 Declared dependency only, zero implementation
- **Why chosen:** Backend-as-a-service — auth, real-time data, and (with a single settings flag) built-in offline persistence, avoiding the need to hand-roll a custom API server for the MVP stage.
- **Current implementation status:** Present in `pubspec.yaml`/`pubspec.lock` (`firebase_core: 2.32.0`, `cloud_firestore: 4.17.5` resolved). **No `Firebase.initializeApp()` call exists anywhere**, no `firebase_options.dart`, no `google-services.json`/`GoogleService-Info.plist`. Calling any Firestore API today would throw at runtime.
- **Future usage:** Full planned architecture in `PROJECT_CONTEXT.md` §9 — user accounts, `incidentReports`, `sosEvents`, `riskZones` collections.

### Hive — 🔴 Not a dependency, zero code
- **Why chosen (per README):** Fast, pure-Dart, key-value local database — natural fit for offline-first caching without native platform channels.
- **Current implementation status:** Absent from `pubspec.yaml` entirely.
- **Future usage:** Local boxes for cached contacts, a pending-SOS/pending-report sync queue, and (eventually) persisted session state to replace the current in-memory-only `AuthState`. Full plan in `PROJECT_CONTEXT.md` §10.

### Python / Flask / Scikit-learn / Pandas — 🔴 Not present anywhere in this repository
- **Why chosen (per README):** Standard, well-supported Python data-science stack for a tabular risk-prediction model, served via a lightweight Flask API.
- **Current implementation status:** No `.py` files, no `requirements.txt`, no backend folder exist in this project directory at all. This would need to live in a separate repository/service, not inside the Flutter project.
- **Future usage:** Full pipeline described in `PROJECT_CONTEXT.md` §11 (Pandas preprocessing → feature engineering → Scikit-learn model → risk score → written to Firestore → rendered as a Flutter map heatmap).

---

## Messaging

### Native Android SMS (via `url_launcher`) — ✅ Implemented, with an important caveat
- **Why chosen:** Zero-cost, no-backend way to deliver an SOS with a location link without a paid SMS gateway.
- **Current implementation:** `sendSOS()` in `main.dart` opens an `sms:` URI (`Uri(scheme: 'sms', path: '7755922469', queryParameters: {'body': message})`) via `url_launcher`, which hands off to the device's default SMS app. **This is not a silent/programmatic send** — the user must manually tap "send" in the SMS app that opens. It also is not a true "native Android SMS API" integration (e.g., `SmsManager`) — it's a deep link.
- **Future usage:** Twilio (or a similar SMS gateway) planned as a replacement/supplement for guaranteed, automatic delivery that doesn't depend on the user's own SMS app/plan/manual action.

---

## Tooling / Infrastructure

### Git / GitHub — 🔴 Not currently active in this working directory
- **Why chosen:** Standard version control and collaboration platform.
- **Current implementation status:** A `.gitignore` is present, but **no `.git` directory exists** — `git status` fails with "not a git repository." No commit history to inspect, no remote to verify. The README's claim of being "publicly available... for hackathon evaluation" implies a GitHub remote exists somewhere, but it is not connected to this local working copy.
- **Future usage:** Should be initialized (`git init` + first commit) before further collaborative work — confirm with the project owner first, since initializing version control is a meaningful, first-time state change for this directory.

### Antigravity SDK — 🔴 Not found
- No reference to "Antigravity" (in any casing/spelling) exists anywhere in `pubspec.yaml`, `pubspec.lock`, source files, or config files. This appears to be part of the generic analysis template requested rather than an actual dependency of this project. Flagged here rather than silently omitted, in case the user expected it to be present.

---

## Full dependency-level tech list

Every package in `pubspec.yaml` is covered in dependency form in `DEPENDENCIES.md`; the table above only covers the named technologies from the requested analysis scope plus the ones actually found in `pubspec.yaml` (`google_maps_flutter`, `geolocator`, `url_launcher`, `firebase_core`, `cloud_firestore`, `cupertino_icons`, `flutter_lints`).
