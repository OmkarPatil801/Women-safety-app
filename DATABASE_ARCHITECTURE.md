# DATABASE_ARCHITECTURE.md — Women Safety App

> The local persistence layer, migrated from Isar to Drift. This document is the reference for the whole team — especially anyone building the Report Screen, Report Form, Map UI, or Community Features — on how to talk to the database **without ever importing Drift directly**.

---

## Why this migration happened

Isar was removed because it was incompatible with this project's Flutter/Android Gradle environment. Drift was chosen as the replacement: it compiles to plain SQLite via `sqlite3_flutter_libs` (a well-supported, actively maintained native SQLite binary for Flutter), has first-class Android/iOS support, built-in migration tooling, and a mature, widely-used codegen pipeline. This was a **redesign**, not a find-and-replace — table schemas, repository method names, and even the persistence-layer folder boundaries changed as part of this work.

---

## 1. Folder Structure

```
lib/
├── database/
│   ├── app_database.dart       @DriftDatabase class — the only file that
│   │                            knows about all 6 tables together
│   ├── app_database.g.dart     generated: table implementations + the
│   │                            actual data classes (User, Contact, …)
│   └── database.dart           DatabaseService — the singleton every
│                                repository talks to
├── models/
│   ├── user.dart                Drift Table *schema* definitions only.
│   ├── contact.dart              These are NOT the types you work with —
│   ├── report.dart               they only describe columns. The usable
│   ├── settings.dart             data classes (User, Contact, …) are
│   ├── sos_history.dart          generated into app_database.g.dart,
│   └── pending_sync.dart         imported from there by repositories.
└── repositories/
    ├── user_repository.dart
    ├── contact_repository.dart
    ├── report_repository.dart
    ├── settings_repository.dart
    ├── sos_repository.dart
    └── pending_sync_repository.dart
```

**Why `models/` and `database/` are split the way they are:** Drift's codegen ties the generated row classes (`User`, `Contact`, etc.) to the `@DriftDatabase` class in `app_database.dart`, not to each individual table file. So `lib/models/*.dart` only ever contains **schema** (column definitions) — it's internal to the database layer and nothing outside `lib/database/` and `lib/repositories/` should import it directly.

---

## 2. Drift Setup

### `AppDatabase` (`lib/database/app_database.dart`)

```dart
@DriftDatabase(
  tables: [Users, Contacts, Reports, SosHistories, SettingsTable, PendingSyncs],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.executor);

  @override
  int get schemaVersion => 2;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onCreate: (migrator) => migrator.createAll(),
    onUpgrade: (migrator, from, to) async {
      if (from < 2) {
        // Adds Contact.isPrimary — see §5a, Primary Emergency Contacts.
        await migrator.addColumn(contacts, contacts.isPrimary);
      }
    },
  );
}
```

Adding a table later means adding it to the `tables:` list above and bumping `schemaVersion` with an `onUpgrade` step — this is the single place that changes. **Schema version 2** (above) is the first real example of this: it adds one column to the existing `contacts` table without touching any other table, and existing rows get the column's default value (`false`) automatically — no manual backfill needed.

### `DatabaseService` (`lib/database/database.dart`)

Same role as before the migration — singleton, owns open/close, is the only class repositories depend on for persistence:

```dart
class DatabaseService {
  DatabaseService._internal();
  static final DatabaseService instance = DatabaseService._internal();

  AppDatabase? _database;
  AppDatabase get database => /* throws if not yet opened */;

  Future<void> openDatabase() async {
    if (_database != null) return;
    _database = AppDatabase(_openConnection());
  }

  Future<void> close() async { /* ... */ }

  LazyDatabase _openConnection() {
    return LazyDatabase(() async {
      final directory = await getApplicationDocumentsDirectory();
      final file = File(p.join(directory.path, 'women_safety_app.sqlite'));
      return NativeDatabase.createInBackground(file);
    });
  }
}
```

`main()` calls `await DatabaseService.instance.openDatabase()` once, before `runApp()` — unchanged from before the migration. The `LazyDatabase` wrapper means the actual file is opened on the first query, not blocking app startup on disk I/O.

### Dependencies (`pubspec.yaml`)

Removed: `isar`, `isar_flutter_libs`, `isar_generator`.
Added: `drift`, `sqlite3_flutter_libs`, `path` (dependencies); `drift_dev` (dev dependency, alongside the existing `build_runner`).

### Regenerating code

```
dart run build_runner build --delete-conflicting-outputs
```
Run this after any change to a table definition in `lib/models/`.

---

## 3. Repositories

Every repository follows the same shape: an abstract interface (Dependency Inversion) plus a `Drift*Repository` implementation. All expose the same core method set — `create`, `update`, `delete`, `findById`, `getAll`, `search` — with a couple of documented, justified additions:

| Repository | Extra methods | Why |
|---|---|---|
| `UserRepository` | — | — |
| `ContactRepository` | `getPrimaryContacts()` | `sendSOS()` needs every Primary Emergency Contact, filtered in SQL — see §5a |
| `ReportRepository` | `getUnsynced()` | Directly serves the offline-first/sync-prep goal (§5) |
| `SettingsRepository` | — | — |
| `SOSRepository` | — | — |
| `PendingSyncRepository` | `getUnsynced()` | The whole point of this table is a queue a future sync worker drains |

**No repository method accepts or returns a Drift type** (`Isar`... er, `AppDatabase`, `Value`, `Companion`, `Table`, `QueryBuilder`). They accept and return only the generated data classes (`User`, `Contact`, `Report`, `Settings`, `SosHistory`, `PendingSync`) and plain Dart types.

### The critical wiring detail: exports

Because Drift generates row classes centrally (see §1), each repository file **re-exports** the type it deals in:

```dart
// contact_repository.dart
export '../database/app_database.dart' show Contact;
```

This means a screen only ever needs **one import** — the repository — to get both the methods to call and the type to hold:

```dart
import '../repositories/contact_repository.dart'; // gives you ContactRepository AND Contact
```

The screen never imports `app_database.dart`, never imports `package:drift/drift.dart`, and never sees `Value`, `Companion`, `Table`, or `AppDatabase`.

---

## 4. Models (Table Schemas)

| Table class | Data class | Key columns | Notable design calls |
|---|---|---|---|
| `Users` | `User` | `id, name, phone, email?, createdAt` | `email` nullable — nothing in the app collects one yet |
| `Contacts` | `Contact` | `id, name, phone, relationship?, isPrimary` | No owning-user column — contacts are device-local, which still preserves "SOS works without login". `isPrimary` added in schema v2 (see §5a) |
| `Reports` | `Report` | `id, latitude, longitude, description?, category, severity, imagePath?, synced, timestamp` | `category`/`severity` are plain text, not enums — no fixed taxonomy exists yet |
| `SettingsTable` | `Settings` | `id, darkMode, notifications, language` | `darkMode` defaults `true`, matching the app's current always-dark UI |
| `SosHistories` | `SosHistory` | `id, latitude, longitude, timestamp, sent` | Deliberately simpler than the pre-migration schema — no owner, no delivery-status enum |
| `PendingSyncs` | `PendingSync` | `id, entityType, entityId, action, createdAt, synced` | `entityType`/`action` are Drift `textEnum` columns backed by plain Dart enums (`SyncEntityType`, `SyncAction`) |

---

## 5a. Primary Emergency Contacts

**What they are:** a boolean flag (`Contact.isPrimary`) on each saved contact, set via a "Primary Emergency Contact" switch in the Emergency Contacts screen. Any number of contacts can be marked primary — there is no cap, and no rule that only one contact may hold the flag. Contacts marked primary show a ⭐ before their name in the list (e.g. "⭐ Mom") so it's clear at a glance who SOS will notify; non-primary contacts (e.g. "Friend", "Office") display normally.

**Why they exist:** before this feature, `sendSOS()` messaged *every* saved contact — useful as a default, but with no way to distinguish "text this person the instant something happens" from "keep this number around but don't spam them every time." Primary Contacts let the user curate exactly who receives an SOS, independent of how many contacts they've saved overall.

**How SOS retrieves them:** `sendSOS()` (`lib/main.dart`) calls `_contactRepository.getPrimaryContacts()`, which runs entirely in SQL:

```dart
// ContactRepository (Drift implementation)
Future<List<Contact>> getPrimaryContacts() {
  final db = _databaseService.database;
  return (db.select(db.contacts)..where((c) => c.isPrimary.equals(true))).get();
}
```

This compiles to `SELECT * FROM contacts WHERE is_primary = 1` — filtering happens inside the database, not by fetching every contact and filtering in Dart. If the result is empty, `sendSOS()` shows a SnackBar ("No Primary Emergency Contacts selected. Please mark at least one contact as Primary.") and does not attempt to send anything. If contacts exist, their phone numbers are joined into one comma-separated recipient list and passed into the same single `sms:` URI mechanism as before — the message format and live-location link are unchanged.

---

## 5. Future Firebase Synchronization

**Not implemented in this migration — only prepared for**, per instruction. The intended flow:

```
Local write (any repository's create/update/delete)
        │
        ▼
Caller also writes a PendingSyncRepository.create(...) entry
        │
        ▼
PendingSync row sits with synced = false
        │
        ▼  (future work, not built yet)
A sync worker calls PendingSyncRepository.getUnsynced()
        │
        ▼
For each entry: read the real record via the matching repository's
findById(entityId), push it to Firestore, then mark synced = true
```

`ReportRepository.getUnsynced()` exists for the same reason on the `Reports` table directly — reports are the first feature expected to need cloud sync (per the "Reports are stored locally first" requirement), so both the per-row `synced` flag and the generic `PendingSync` queue are available depending on how the eventual sync worker is designed.

`DatabaseService` itself remains deliberately Firebase-unaware — a future `FirebaseSyncService` will sit **beside** it, reading through the repositories like any other caller, never modifying `DatabaseService` or `AppDatabase`.

---

## 6. How Teammates Should Interact With the Database

**The rule: import a repository. Never import anything under `lib/database/`, and never import `package:drift/drift.dart`.**

Example — Report Screen / Report Form:

```dart
import '../repositories/report_repository.dart'; // → gives you ReportRepository and Report

class ReportFormScreen extends StatefulWidget {
  ReportFormScreen({ReportRepository? repository})
      : repository = repository ?? DriftReportRepository();

  final ReportRepository repository;
  // ...
}

// Saving a report:
final report = Report(
  id: 0, // ignored by create() — Drift assigns the real id
  latitude: lat,
  longitude: lng,
  category: category,
  severity: severity,
  description: description,
  imagePath: imagePath,
  synced: false,
  timestamp: DateTime.now(),
);
await widget.repository.create(report);
```

```dart
// Reading/searching reports for the Map UI or Community Features:
final all = await reportRepository.getAll();
final matches = await reportRepository.search('harassment');
final unsynced = await reportRepository.getUnsynced();
```

That's the entire surface. No `SELECT`, no `INSERT`, no `Companion`, no `Value`, no knowledge that SQLite (or Drift, or Isar before it) is even involved — exactly as required.

**Available repositories today:** `UserRepository`, `ContactRepository`, `ReportRepository`, `SettingsRepository`, `SOSRepository`, `PendingSyncRepository` — all under `lib/repositories/`, all following the pattern above.

**Not implemented in this pass:** the Report UI itself, Firebase, and any sync worker — those remain separate, future work.
