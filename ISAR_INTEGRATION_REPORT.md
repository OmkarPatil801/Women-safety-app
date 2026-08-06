# ISAR_INTEGRATION_REPORT.md — Women Safety App

> Pre-implementation architecture report. **No files were modified to produce this report.** Written per the standing rule in `PROJECT_CONTEXT.md` and the architect workflow: understand fully, explain fully, before touching code.
>
> Analysis date: 2026-08-05 (re-verified against the live tree; one change since the original `PROJECT_CONTEXT.md` audit is noted below).

---

## Delta since PROJECT_CONTEXT.md

`pubspec.yaml` now declares Isar dependencies that were **not** present during the original audit:

```yaml
dependencies:
  isar: ^3.1.0+1
  isar_flutter_libs: ^3.1.0+1

dev_dependencies:
  isar_generator: ^3.1.0+1
  build_runner: ^2.4.13
```

These were added (by the user, prior to this task) but are **not yet used anywhere** — no `Isar.open()` call, no `@collection` model, no generated `.g.dart` file, no `part` directive exists in any `.dart` file. This is dependency scaffolding only. Everything else in the project (all 3 Dart files, `AndroidManifest.xml`, features, architecture) is unchanged from the prior audit — re-verified by re-reading every file directly for this report.

---

## Current Project Structure

```
lib/
├── main.dart          (888 lines — app entry, AuthState, HomeScreen, LoginScreen, _AuthCard)
├── map_screen.dart     (65 lines — MapScreen, live Google Map)
└── config.dart         (1 line — hardcoded Maps API key constant, unused dead import)
```

No subfolders exist under `lib/` — no `screens/`, `widgets/`, `models/`, `services/`, `repositories/`, or `data/`. This is a **flat, single-layer structure**: three top-level files, one of which (`main.dart`) contains four classes/screens at once.

---

## Existing Features

| Feature | Status |
|---|---|
| One-tap SOS (GPS + prefilled SMS via `sms:` URI) | ✅ Working |
| Google Maps live-location screen | ✅ Working (Android only) |
| Runtime location permission handling | ✅ Working |
| In-memory login/registration | ✅ Working, but non-persistent (lost on restart) |
| Feature gating by login state | ✅ Working (UI-level only) |
| Live Location Tracking tile | 🔒 Stub — "coming soon" snackbar only |
| Emergency Contacts tile | 🔒 Stub — "coming soon" snackbar only |
| Fake Call tile | 🔒 Stub — "coming soon" snackbar only |

Full detail already documented in `PROJECT_CONTEXT.md` §5.

---

## Current State Management

**None — plain `StatefulWidget` + `setState()`.** No Provider, Riverpod, Bloc, GetX, or InheritedWidget-based store. The one piece of "global" state is `AuthState` in `main.dart`: a static class holding `loggedInUser`, `loggedInName`, and an in-memory `Map<String, Map<String,String>> _users`. It is read/written directly by widgets (`HomeScreen`, `LoginScreen`) with no abstraction layer — screens call `AuthState.login(...)`/`AuthState.register(...)` directly and then call `setState(() {})` on themselves to refresh.

---

## Existing Services

**None.** There is no `services/` layer, no dedicated class wrapping `Geolocator` or `url_launcher` — both are called directly, inline, inside widget methods (`sendSOS()` in `_HomeScreenState`, `getLocation()` in `_MapScreenState`). No HTTP client, no Firebase service wrapper (Firebase is a declared-but-unused dependency, see `PROJECT_CONTEXT.md` §9).

---

## Existing Models

**None.** There is no `models/` folder and no data classes anywhere in the project. `AuthState._users` stores raw `Map<String, Map<String, String>>` rather than a `User` class. `MapScreen` stores a bare `LatLng` (from `google_maps_flutter`) rather than any app-defined location model. This is the most direct gap relevant to Isar: **Isar requires `@collection`-annotated Dart classes**, and none of the current data shapes are modeled as classes at all yet.

---

## Existing Widgets

No separate reusable-widget files exist. Small presentational helpers are defined as **private methods returning `Widget`** inside their owning `State` class, not as standalone `Widget` subclasses in their own files:

- `_HomeScreenState._instructionStep(...)`, `_HomeScreenState._featureTile(...)` — in `main.dart`.
- `_LoginScreenState._tab(...)`, `_LoginScreenState._field(...)` — in `main.dart`.
- `_AuthCard` — the one actual standalone `StatelessWidget` class, still defined inline in `main.dart` rather than its own file.

---

## Existing Screens

| Screen | Class | File |
|---|---|---|
| Home / SOS | `HomeScreen` (→ `_HomeScreenState`) | `lib/main.dart` |
| Login / Register | `LoginScreen` (→ `_LoginScreenState`) | `lib/main.dart` |
| Safety Map | `MapScreen` (→ `_MapScreenState`) | `lib/map_screen.dart` |

Navigation is plain `Navigator.push`/`pop` with `MaterialPageRoute` — no named routes, no route table, no `go_router`/`auto_route`.

---

## Current Dependencies

Full table in `DEPENDENCIES.md`; the Isar-relevant additions are:

| Package | Version | Role |
|---|---|---|
| `isar` | ^3.1.0+1 | Core embedded NoSQL database engine |
| `isar_flutter_libs` | ^3.1.0+1 | Native Isar binaries bundled for Flutter |
| `isar_generator` (dev) | ^3.1.0+1 | Code generator producing `IsarCollection` schemas from `@collection` classes |
| `build_runner` (dev) | ^2.4.13 | Runs the codegen step (`dart run build_runner build`) |

Note: Isar 3.1.0+1 is the last stable release of "Isar Community" v3 before the ecosystem's transition — it is a reasonable, still-widely-used pin, not a broken/yanked version, so no version concern to flag here.

---

## Missing Architecture

Cross-referencing `PROJECT_CONTEXT.md`'s existing findings, the specific gaps relevant to introducing a local database are:

1. **No data layer at all.** No models, no repositories, no services — data currently either lives in a widget's own `State` (e.g. `MapScreen.currentPosition`) or in the single static `AuthState` class. There is nowhere for Isar-backed code to plug into that isn't itself new.
2. **No persistence anywhere.** `AuthState` is the clearest symptom — a full login/register flow that forgets every user on app restart. This is the direct, concrete use case Isar should solve first.
3. **No separation between "screen" and "how screen gets its data."** Widgets call `Geolocator`/`url_launcher`/`AuthState` directly. Introducing Isar without adding a thin repository layer in between would just create a fourth thing screens call directly — worth avoiding.
4. **No folder structure to hang new code on.** A flat `lib/` with 3 files works today; it will not stay readable once models + an Isar service + repositories are added on top, per the earlier "Missing Architecture" note already in `PROJECT_CONTEXT.md`.
5. **No app-level initialization hook.** `main()` is currently a single line (`runApp(SafetyApp())`) — opening the Isar instance requires an async step before `runApp()`, which doesn't exist yet (comparable to the already-noted-missing `Firebase.initializeApp()` gap).

---

## Recommended Folder Structure

Introduced **incrementally**, only as far as Isar integration actually requires — not a full speculative rewrite (per the standing "never rewrite architecture unless necessary" rule):

```
lib/
├── main.dart                      (unchanged responsibilities; gains one async init line)
├── config.dart                    (unchanged)
├── map_screen.dart                (unchanged)
├── models/
│   └── emergency_contact.dart     (new — @collection Isar model)
├── data/
│   └── isar_service.dart          (new — owns Isar.open(), exposes the Isar instance)
└── repositories/
    └── emergency_contact_repository.dart   (new — CRUD methods over the Isar collection; the only thing screens talk to)
```

This is the **minimum** structure needed to give Isar a proper home without disturbing the three existing files' current responsibilities. `screens/`, `widgets/`, and further `services/` splitting are **not** proposed here — they are not required by the Isar work itself, and adding them now would be scope creep beyond this task (flagged as a possible *separate* future refactor, not bundled into this one).

---

## Recommended Database Design

**First collection: `EmergencyContact`.** This is the natural first Isar use case because:
- It directly replaces a currently-broken/non-existent feature (the "Emergency Contacts" tile is a pure stub today).
- It is the one piece of data explicitly called out in `PROJECT_CONTEXT.md`'s roadmap (P2: "Replace hardcoded SOS number with real, user-managed Emergency Contacts") as blocking the app's actual safety promise — `sendSOS()` currently texts a single hardcoded number.
- It has a small, obvious, stable shape — a good first Isar model to introduce without speculative fields.

```dart
@collection
class EmergencyContact {
  Id id = Isar.autoIncrement;

  late String name;
  late String phoneNumber;

  bool isPrimary = false;   // used to pick the sendSOS() recipient when multiple contacts exist
  DateTime createdAt = DateTime.now();
}
```

**Second collection (near-term, not part of this immediate task but worth designing now so schema versions don't collide): `SosEvent`** — a local log of SOS triggers, useful both as an audit trail and as the natural seed for the already-planned offline-sync queue (`PROJECT_CONTEXT.md` §10, "pendingSosBox" in the Hive plan). If Isar is adopted as the offline-first local store instead of Hive, this collection is where that queueing would live:

```dart
@collection
class SosEvent {
  Id id = Isar.autoIncrement;

  late double latitude;
  late double longitude;
  late DateTime timestamp;

  @Enumerated(EnumType.name)
  SosSyncStatus syncStatus = SosSyncStatus.sentLocally;
}

enum SosSyncStatus { sentLocally, syncedToCloud }
```

Only `EmergencyContact` is proposed for immediate implementation; `SosEvent` is documented here for architectural continuity so a future session doesn't re-derive it from scratch, per this file's role as permanent memory — it is **not** part of the integration plan below unless requested.

---

## Recommended Repository Structure

One repository per collection, exposing only the operations screens actually need — no generic/speculative CRUD surface beyond that:

```dart
class EmergencyContactRepository {
  EmergencyContactRepository(this._isar);
  final Isar _isar;

  Future<List<EmergencyContact>> getAll();
  Future<void> add(EmergencyContact contact);
  Future<void> update(EmergencyContact contact);
  Future<void> delete(int id);
  Future<EmergencyContact?> getPrimary();
}
```

`HomeScreen`/a future `ContactsScreen` would depend on `EmergencyContactRepository`, never on `Isar` directly — this keeps the database engine swappable later (e.g., if the project ever migrates to the Hive plan already documented in `PROJECT_CONTEXT.md` §10, or drops one in favor of the other) without screens needing to change.

---

## Integration Plan

**Scope of this plan:** wire up Isar to back a real, persistent Emergency Contacts feature, and use it as the source for `sendSOS()`'s recipient — closing the exact gap flagged as High severity in `PROJECT_CONTEXT.md` §16 (finding #2, hardcoded SOS number) and prioritized as P2 in `ROADMAP.md`.

### 1. What will change
- Add an `EmergencyContact` Isar model (new file).
- Add an `IsarService` that opens the Isar database once at app startup (new file).
- Add an `EmergencyContactRepository` wrapping CRUD over that collection (new file).
- Build out the currently-stub "Emergency Contacts" screen to list/add/edit/delete contacts via the repository (new screen file — this is new functionality behind an existing tile, not a UI redesign).
- Update `sendSOS()` in `main.dart` to read the primary contact from the repository instead of the hardcoded `'7755922469'` string, falling back to the existing hardcoded number only if no contact has been saved yet (preserves current behavior for a first-run user rather than breaking SOS if contacts haven't been set up).
- Add one `await` line in `main()` to initialize Isar before `runApp()`.

### 2. Affected files
| File | Change |
|---|---|
| `lib/main.dart` | `main()` gains an async Isar-init line; `sendSOS()` gains a repository lookup replacing the hardcoded number; the "Emergency Contacts" tile's `onTap` navigates to the new screen instead of showing the "coming soon" snackbar. Everything else in this file (SOS button UI, login flow, theming) is untouched. |
| `lib/models/emergency_contact.dart` | New file — Isar `@collection` model. |
| `lib/data/isar_service.dart` | New file — `Isar.open()` wrapper, single instance. |
| `lib/repositories/emergency_contact_repository.dart` | New file — CRUD methods. |
| `lib/screens/emergency_contacts_screen.dart` | New file — the real screen behind the existing stub tile. |
| `pubspec.yaml` | No change needed — Isar dependencies are already present. |

### 3. Dependencies
- Isar packages already declared (`isar`, `isar_flutter_libs`, `isar_generator`, `build_runner`) — no `pubspec.yaml` edit required.
- Code generation step required after the model is written: `dart run build_runner build --delete-conflicting-outputs` to produce `emergency_contact.g.dart`.
- No new third-party dependency needed beyond what's already staged.

### 4. Scalability
- The repository-over-Isar pattern means additional collections (`SosEvent`, and eventually the community `incidentReports`/`riskZones` data described in `PROJECT_CONTEXT.md` §9–§11) can be added the same way without touching existing screens.
- `IsarService` opens a single shared instance app-wide, which is the standard, scalable Isar usage pattern (avoids repeated schema registration or multiple open handles).

### 5. Offline-first preservation
- This change is a **net gain** for offline-first behavior, not a risk to it: Isar is a local, embedded, always-available database — contacts and (later) SOS events remain fully readable/writable with zero network dependency, directly advancing the offline-first direction already documented as the project's vision.
- `sendSOS()` keeps working exactly as it does today if no contacts have been saved (falls back to the existing hardcoded number) — no regression for a first-run/offline user.

### 6. UI preservation
- No visual changes to `HomeScreen`, the SOS button, or the login flow.
- The "Emergency Contacts" feature tile's appearance is unchanged — only its `onTap` behavior changes, from a snackbar to real navigation, which is the tile already advertising itself as "Add & manage your trusted contacts" (i.e., this fulfills the tile's existing promise rather than altering it).
- The new Emergency Contacts screen itself would follow the existing dark maroon/red theme (`0xFFC0392B` / `0xFF1A0A0A` / `0xFFF1948A`) and existing widget patterns (rounded `Container` cards, same `TextField` styling as `LoginScreen._field`) rather than introducing a new visual language.

### 7. Explicitly not in this plan
- No `SosEvent` collection, no offline-sync queue, no Firebase/Hive changes — those remain future roadmap items, documented above for continuity but not implemented here.
- No change to `AuthState` — migrating auth to something persistent (Isar or Firebase) is a separate, larger decision already flagged in the roadmap and not bundled into this Isar-for-contacts task.
- No folder restructuring beyond the three new files/folders listed above — `screens/`, broader `services/`, and `widgets/` splitting for the *existing* files is not part of this plan.

**This plan is not yet executed.** Per the standing workflow, implementation should begin only after this report is reviewed and the plan above is confirmed.
