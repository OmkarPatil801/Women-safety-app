# DEVELOPMENT_STATUS.md — Women Safety App

> Read-only architecture audit. No code was modified to produce this report.
> Verified directly against the live `lib/` tree — not from memory of past sessions.
> Audit date: 2026-08-06.

---

## 1. Current Folder Structure

```
lib/
├── config/
│   └── config.dart                     Google Maps API key constant
├── core/
│   ├── constants/.gitkeep              empty — placeholder only
│   ├── errors/.gitkeep                 empty — placeholder only
│   ├── helpers/.gitkeep                empty — placeholder only
│   ├── services/.gitkeep               empty — placeholder only
│   └── utils/.gitkeep                  empty — placeholder only
├── database/
│   └── database.dart                   DatabaseService (Isar lifecycle, singleton)
├── models/
│   ├── contact.dart / .g.dart
│   ├── pending_sync.dart / .g.dart
│   ├── report.dart / .g.dart
│   ├── settings.dart / .g.dart
│   ├── sos_history.dart / .g.dart
│   └── user.dart / .g.dart
├── providers/.gitkeep                  empty — placeholder only
├── repositories/
│   ├── contact_repository.dart         wired to a screen
│   ├── report_repository.dart          built, unwired (Reports postponed)
│   ├── settings_repository.dart        built, unwired
│   ├── sos_repository.dart             built, unwired
│   └── user_repository.dart            built, unwired
├── routes/.gitkeep                     empty — placeholder only
├── screens/
│   ├── emergency_contacts_screen.dart  fully wired to ContactRepository
│   └── map_screen.dart                 live Google Map, no persistence
├── services/.gitkeep                   empty — placeholder only
├── widgets/.gitkeep                    empty — placeholder only
└── main.dart                           app entry, AuthState, HomeScreen, LoginScreen
```

10 empty folders exist purely as Clean Architecture scaffolding (`.gitkeep` only, no real files) — see §10.

---

## 2. Database Architecture

`lib/database/database.dart` defines `DatabaseService` — the single owner of the app's local Isar instance.

- **Pattern:** Singleton via private constructor + static `instance` field. Isar only permits one open instance per database name/directory, so every repository shares this one handle.
- **Lifecycle:** `openDatabase()` is called once in `main()`, before `runApp()`, using `WidgetsFlutterBinding.ensureInitialized()` first (required for the async `path_provider` call). `close()` exists for shutdown/test use but is not currently called anywhere.
- **Storage location:** `path_provider`'s `getApplicationDocumentsDirectory()`, database named `women_safety_app`.
- **Schema registration:** all 6 generated collection schemas are registered in one list inside `openDatabase()` — this is the single place a future model's schema gets added.
- **Access pattern:** repositories reach the database only via `DatabaseService.instance.isar` (or an injected `DatabaseService` instance) — no repository opens its own connection, and no Isar type ever appears in a repository's public method signature.
- **Firebase awareness:** none, by design. The class's own doc comment states a future sync layer will read through `DatabaseService.instance.isar` without this file needing to change.

```
main() → WidgetsFlutterBinding.ensureInitialized()
       → DatabaseService.instance.openDatabase()  [awaited]
       → runApp(SafetyApp())
```

---

## 3. Every Isar Collection

| Model | Collection accessor | Purpose | Indexed fields |
|---|---|---|---|
| `User` | `isar.users` | Local user record (future replacement for in-memory `AuthState`) | `phoneNumber` (unique, replace-on-conflict) |
| `Contact` | `isar.contacts` | Emergency contacts | `name` (non-unique) |
| `Report` | `isar.reports` | Community incident reports (feature postponed) | `userId` (non-unique) |
| `Settings` | `isar.settings` | Per-user/guest local preferences | none beyond implicit `id` |
| `SOSHistory` | `isar.sOSHistorys` (Isar's auto-pluralization of the class name) | Append-only SOS trigger log | none beyond implicit `id` |
| `PendingSync` | `isar.pendingSyncs` | Generic local→cloud sync queue | `entityId` (non-unique) |

All 6 schemas are registered in `DatabaseService.openDatabase()`. Only `Contact` is currently read from or written to at runtime (via `EmergencyContactsScreen`) — the other 5 collections exist and are queryable, but nothing in the app writes to them yet.

---

## 4. Every Repository

| Repository | Interface + implementation | Wired into UI? |
|---|---|---|
| `UserRepository` | `UserRepository` / `IsarUserRepository` | **No** — `AuthState` in `main.dart` still handles login in-memory; nothing calls this repository |
| `ContactRepository` | `ContactRepository` / `IsarContactRepository` | **Yes** — `EmergencyContactsScreen` (Create/Read/Update/Delete/Search) |
| `ReportRepository` | `ReportRepository` / `IsarReportRepository` | **No** — Reports feature explicitly postponed; file exists, unreferenced anywhere else |
| `SettingsRepository` | `SettingsRepository` / `IsarSettingsRepository` | **No** — no Settings screen exists yet |
| `SOSRepository` | `SOSRepository` / `IsarSOSRepository` (operates on `SOSHistory`) | **No** — `sendSOS()` in `main.dart` does not log to it |

All 5 follow the same pattern: an abstract interface (Dependency Inversion), a concrete `Isar*Repository` implementation that only talks to `DatabaseService`, constructor-injectable for testing (`[DatabaseService? databaseService]`), and Create/Read/Update/Delete/Search methods returning plain model types — never an Isar type.

---

## 5. Every Service

**`DatabaseService`** (`lib/database/database.dart`) is the only implemented service in the project — it is not located in `core/services/` or `services/`, both of which are still empty placeholders (see §10). It owns Isar's lifecycle only.

No other services exist. In particular:
- No `LocationService` wrapping `Geolocator` — both `sendSOS()` (`main.dart`) and `MapScreen` call `Geolocator` directly.
- No `SmsService`/`SosService` wrapping the `url_launcher` SMS-intent logic — it's inline in `sendSOS()`.
- No `AuthService` — `AuthState` (a static class in `main.dart`, not in any service folder) plays this role today, in-memory only.
- No connectivity/sync service — nothing consumes `PendingSync` yet.

---

## 6. Every Model

| Model | Key fields | Notes |
|---|---|---|
| `User` | `phoneNumber` (unique), `name`, `passwordHash?`, `firebaseUid?`, `isSynced`, `createdAt`, `updatedAt?`, `lastLoginAt?` | Designed to replace `AuthState`; not yet consumed anywhere |
| `Contact` | `userId?` (nullable — supports no-login SOS), `name`, `phoneNumber`, `isPrimary`, `relationship?`, `createdAt`, `updatedAt?`, `isSynced` | The only model with live production traffic today |
| `Report` | `userId` (required), `latitude`, `longitude`, `category`, `description?`, `mediaUrls`, `upvotes`, `isVerified`, `createdAt`, `isSynced` | Feature postponed; model complete and unused |
| `Settings` | `userId?`, `emergencyMessage`, `sosRequiresConfirmation`, `locationSharingEnabled`, `updatedAt?`, `isSynced` | No screen reads or writes this yet |
| `SOSHistory` | `userId?`, `latitude`, `longitude`, `contactPhoneNumber`, `deliveryStatus` (enum), `triggeredAt`, `isSynced` | `sendSOS()` does not create these entries yet |
| `PendingSync` | `entityType` (enum), `entityId`, `operationType` (enum), `payload?`, `createdAt`, `syncedAt?`, `retryCount`, `lastError?` | No code creates or processes entries yet — pure future-sync scaffolding |

---

## 7. Current Navigation Flow

```
SafetyApp (MaterialApp, dark theme)
  └── HomeScreen (home route)
        ├── tap SOS circle           → sendSOS() (no navigation)
        ├── long-press SOS circle    → MapScreen
        ├── "Login" / avatar button  → LoginScreen (pop returns to HomeScreen)
        ├── tile: Live Location Tracking  → locked snackbar only (no screen exists)
        ├── tile: Emergency Contacts      → EmergencyContactsScreen (if logged in)
        │                                 → else: "login to use" snackbar with Login action
        ├── tile: Safety Map              → MapScreen (if logged in)
        │                                 → else: "login to use" snackbar
        └── tile: Fake Call               → locked snackbar only (no screen exists)

LoginScreen
  └── Sign In / Register tabs → on success, Navigator.pop() back to HomeScreen

EmergencyContactsScreen
  └── + FAB → _ContactFormDialog (Add)
  └── edit icon per row → _ContactFormDialog (Edit, pre-filled)
  └── delete icon per row → confirmation AlertDialog → delete
```

All navigation is plain `Navigator.push`/`pop` with `MaterialPageRoute` — no named routes, no route table (the `routes/` folder is an empty placeholder, §10).

---

## 8. Current State Management

**No state management library** (no Provider, Riverpod, Bloc, GetX). Every screen is a `StatefulWidget` using plain `setState()`.

- `AuthState` (`main.dart`) is a static, process-lifetime-only class acting as ad hoc global state for login — not persisted, not reactive (screens call `setState(() {})` on themselves after navigating back from `LoginScreen` to force a rebuild, rather than listening to any change notification).
- `EmergencyContactsScreen` holds its own list of `Contact` in local `State` and reloads it manually after each mutation (`_loadContacts()` called after create/update/delete) — no shared/reactive data layer.
- The `providers/` folder is an empty placeholder (§10) — the intended home for a future state-management layer once one is introduced.

---

## 9. Which Files Are Unused

| File | Why unused |
|---|---|
| `lib/config/config.dart` | `GOOGLE_MAPS_API_KEY` constant is declared but never read anywhere in Dart code — the Google Maps SDK actually gets its key from `AndroidManifest.xml`'s meta-data tag instead. `map_screen.dart` imports this file but doesn't reference the constant, producing an `unused_import` warning. |
| `lib/repositories/user_repository.dart` | Built, never imported by any screen — `AuthState` still handles auth in-memory. |
| `lib/repositories/report_repository.dart` | Built, never imported anywhere — Reports feature explicitly postponed. |
| `lib/repositories/settings_repository.dart` | Built, never imported by any screen — no Settings UI exists. |
| `lib/repositories/sos_repository.dart` | Built, never imported anywhere — `sendSOS()` doesn't log history yet. |
| `lib/models/pending_sync.dart` (and its collection) | Schema registered, but nothing in the app ever creates, reads, or processes a `PendingSync` record. |

**Unused third-party packages** (declared in `pubspec.yaml`, zero references in `lib/`): `firebase_core`, `cloud_firestore`, `cupertino_icons`. Confirmed via search — the only "Firebase" mentions anywhere in `lib/` are doc comments describing future intent, not actual API calls.

---

## 10. Which Files Are Placeholders

All 9 remaining empty folders under `lib/` contain only a `.gitkeep` marker and no real Dart file:

```
core/constants/.gitkeep
core/errors/.gitkeep
core/helpers/.gitkeep
core/services/.gitkeep
core/utils/.gitkeep
providers/.gitkeep
routes/.gitkeep
services/.gitkeep
widgets/.gitkeep
```

These exist purely as Clean Architecture scaffolding from the earlier folder-structure task — no code has been written into any of them yet.

---

## 11. Which Screens Are Incomplete

| Screen | Incomplete parts |
|---|---|
| `HomeScreen` (`main.dart`) | "Live Location Tracking" and "Fake Call" tiles are pure UI stubs — tapping either only shows a "coming soon" snackbar via `_onLockedFeatureTap`, regardless of login state. `sendSOS()` still sends to a single hardcoded phone number instead of reading from `ContactRepository`. |
| `LoginScreen` (`main.dart`) | Fully functional as a UI flow, but backed entirely by in-memory `AuthState` — no real authentication, no persistence across app restarts, passwords stored unhashed. |
| `MapScreen` | Renders live location on Android only — no `GMSServices.provideAPIKey` call exists for iOS, so the map will not render there. No markers, no heatmap, no route overlay (all explicitly future work). |
| `EmergencyContactsScreen` | The one screen with no known functional gaps against its own scope — see §12. |

No screen exists yet for: Settings, SOS History, or Reports (the last is intentionally postponed).

---

## 12. Which Features Are Production-Ready

Strictly speaking, **no feature in this app is production-ready** — none has real authentication, a rotated/restricted API key, real release signing, or a working test suite (see the project's `SECURITY.md`). Within that caveat, ranked by how close each is:

- **Emergency Contacts (Isar-backed CRUD)** — functionally complete for its defined scope: Add/Edit/Delete/Read/Search all work end-to-end against real local persistence, data survives app restarts, offline by nature. This is the most complete feature in the codebase.
- **SOS core flow (GPS fetch + SMS intent)** — works reliably on Android as designed, but "designed" here means opening the SMS app pre-filled, not confirmed automatic delivery, and it still targets a single hardcoded number rather than a user's real contacts.
- **Local database layer (Isar)** — the engine itself (`DatabaseService`, schema registration, all 6 models) is solid and has been verified to build and analyze with zero errors, but most of it has no UI consumer yet.

---

## 13. Which Features Are Partially Implemented

| Feature | What exists | What's missing |
|---|---|---|
| Login / Registration | Full UI, tab switching, validation messages | Real backend, persistence, password hashing |
| Safety Map | Live location render (Android) | iOS support, markers, heatmap, safe-route overlay |
| SOS | GPS + SMS-intent flow | Reading from `ContactRepository` instead of a hardcoded number, logging to `SOSRepository`/`SOSHistory` |
| Emergency Contacts | Full local CRUD | Not yet the source `sendSOS()` actually reads from (the repository and screen are done, but `sendSOS()` in `main.dart` hasn't been updated to use them) |
| Local sync scaffolding (`PendingSync`) | Model + schema | No code ever creates, reads, or drains a queue entry |
| User persistence | Model + repository | Not wired to `AuthState` or any screen |
| Settings | Model + repository | No screen; nothing reads `emergencyMessage`/`sosRequiresConfirmation` at SOS-time |
| Reports | Model + repository | Explicitly postponed — UI owned by another team member |

---

## 14. What Should Be Built Next, In Dependency Order

Ordered so each step only depends on things that already exist:

1. **Wire `sendSOS()` to `ContactRepository`.** Lowest effort, highest safety impact — the repository and data already exist (§4); this just replaces the hardcoded number with `getPrimary(AuthState.loggedInUser)`, falling back to the current hardcoded number if no contact is saved. Closes the longest-standing known defect in the app.
2. **Log every SOS trigger to `SOSRepository`.** Depends on nothing new — `SOSRepository` already exists; add one `create()` call inside `sendSOS()` after step 1.
3. **Build a Settings screen wired to `SettingsRepository`.** Depends on nothing new. Gives users control over `emergencyMessage` and `sosRequiresConfirmation`, both already modeled.
4. **Have `sendSOS()` read `Settings.emergencyMessage`/`sosRequiresConfirmation`.** Depends on step 3 existing — small follow-up once Settings has real data to read.
5. **Migrate `AuthState` to `UserRepository`-backed persistent login.** Depends on `UserRepository` (exists) — this is the first step that changes existing behavior (accounts survive restarts) rather than only adding new behavior, so it deserves its own careful pass and confirmation before starting, per this project's standing workflow.
6. **Live Location Tracking (real implementation).** Needs a new `LocationService` (home: `core/services/` or `services/`, still empty) wrapping continuous `Geolocator` streaming — no existing service to build on, so this is more work than 1–4.
7. **Fake Call.** Self-contained — no data-layer dependency at all, could be built independently of this ordering whenever convenient.
8. **Reports feature.** Deliberately deferred — `ReportRepository` is ready and waiting; pick this up once the teammate's Report UI is ready to integrate.
9. **`PendingSync`-driven offline→Firebase sync.** Depends on Firebase actually being initialized first (currently zero `Firebase.initializeApp()` anywhere, despite the dependency being declared) — this is the largest structural item and should come after the local-first features above have stabilized, not before.
10. **Security/release hardening** (rotate the committed Maps API key, add the missing `INTERNET` permission, real release signing, fix the stale `test/widget_test.dart`, wire the iOS Maps key). Not blocking for further feature work, but blocking for any real release — can be scheduled in parallel with the above at any point.
