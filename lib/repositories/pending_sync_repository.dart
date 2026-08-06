import 'package:drift/drift.dart';

import '../database/app_database.dart';
import '../database/database.dart';

/// Re-exports the generated [PendingSync] data class so callers only
/// ever need to import this repository file — never `app_database.dart`
/// or Drift itself — to work with the sync queue.
export '../database/app_database.dart' show PendingSync;

/// Re-exports the plain Dart enums used by [PendingSync] — these aren't
/// Drift types, but callers still shouldn't need a second import to
/// construct a valid entry.
export '../models/pending_sync.dart' show SyncEntityType, SyncAction;

/// Abstraction over persistence for [PendingSync] records — the local
/// sync queue that will drive future Firebase synchronization.
///
/// Callers must depend on this interface, never on [DatabaseService] or
/// Drift types directly. No Firebase code exists yet — this repository
/// only lets local code enqueue and inspect pending changes; a future
/// sync worker will drain the queue this exposes.
abstract class PendingSyncRepository {
  /// Enqueues a new pending change. Returns the same data with its
  /// assigned id.
  Future<PendingSync> create(PendingSync entry);

  /// Looks up a queue entry by its local id. Returns null if not found.
  Future<PendingSync?> findById(int id);

  /// Returns every queue entry, synced and unsynced alike.
  Future<List<PendingSync>> getAll();

  /// Returns queue entries that have not yet been pushed to Firebase —
  /// what a future sync worker would actually process.
  Future<List<PendingSync>> getUnsynced();

  /// Persists changes to an existing [PendingSync] entry (e.g. marking
  /// it synced after a successful push). Returns the same instance once
  /// written.
  Future<PendingSync> update(PendingSync entry);

  /// Deletes the queue entry with the given local id. Returns true if a
  /// record was actually deleted.
  Future<bool> delete(int id);

  /// Returns queue entries whose entity type or action matches [query]
  /// (case-insensitive). Both fields are enums rather than free text, so
  /// this matches against their names (e.g. "contact", "delete") rather
  /// than a substring of arbitrary text.
  Future<List<PendingSync>> search(String query);
}

/// Drift-backed implementation of [PendingSyncRepository].
///
/// Talks only to [DatabaseService] to reach the shared database.
class DriftPendingSyncRepository implements PendingSyncRepository {
  DriftPendingSyncRepository([DatabaseService? databaseService])
      : _databaseService = databaseService ?? DatabaseService.instance;

  final DatabaseService _databaseService;

  @override
  Future<PendingSync> create(PendingSync entry) async {
    final db = _databaseService.database;
    final id = await db.into(db.pendingSyncs).insert(
          PendingSyncsCompanion.insert(
            entityType: entry.entityType,
            entityId: entry.entityId,
            action: entry.action,
            createdAt: Value(entry.createdAt),
            synced: Value(entry.synced),
          ),
        );
    return entry.copyWith(id: id);
  }

  @override
  Future<PendingSync> update(PendingSync entry) async {
    final db = _databaseService.database;
    await db.update(db.pendingSyncs).replace(entry);
    return entry;
  }

  @override
  Future<PendingSync?> findById(int id) {
    final db = _databaseService.database;
    return (db.select(db.pendingSyncs)..where((p) => p.id.equals(id)))
        .getSingleOrNull();
  }

  @override
  Future<List<PendingSync>> getAll() {
    final db = _databaseService.database;
    return db.select(db.pendingSyncs).get();
  }

  @override
  Future<List<PendingSync>> getUnsynced() {
    final db = _databaseService.database;
    return (db.select(db.pendingSyncs)..where((p) => p.synced.equals(false)))
        .get();
  }

  @override
  Future<bool> delete(int id) async {
    final db = _databaseService.database;
    final rowsDeleted = await (db.delete(db.pendingSyncs)
          ..where((p) => p.id.equals(id)))
        .go();
    return rowsDeleted > 0;
  }

  @override
  Future<List<PendingSync>> search(String query) async {
    final lowerQuery = query.toLowerCase();
    final all = await getAll();
    return all
        .where((entry) =>
            entry.entityType.name.toLowerCase().contains(lowerQuery) ||
            entry.action.name.toLowerCase().contains(lowerQuery))
        .toList();
  }
}
