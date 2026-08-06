import 'package:drift/drift.dart';

import '../database/app_database.dart';
import '../database/database.dart';

/// Re-exports the generated [SosHistory] data class so callers only ever
/// need to import this repository file — never `app_database.dart` or
/// Drift itself — to work with SOS history.
export '../database/app_database.dart' show SosHistory;

/// Abstraction over persistence for [SosHistory] records.
///
/// Named `SOSRepository` (rather than `SOSHistoryRepository`) to match
/// the requested repository list, but it operates on the [SosHistory]
/// table — the only SOS-related table defined so far.
///
/// Callers must depend on this interface, never on [DatabaseService] or
/// Drift types directly.
abstract class SOSRepository {
  /// Persists a new [SosHistory] entry. Returns the same data with its
  /// assigned id.
  Future<SosHistory> create(SosHistory entry);

  /// Looks up an SOS history entry by its local id. Returns null if not
  /// found.
  Future<SosHistory?> findById(int id);

  /// Returns every locally stored SOS history entry.
  Future<List<SosHistory>> getAll();

  /// Persists changes to an existing [SosHistory] entry (e.g. flipping
  /// [SosHistory.sent] once delivery is confirmed). Returns the same
  /// instance once written.
  Future<SosHistory> update(SosHistory entry);

  /// Deletes the SOS history entry with the given local id. Returns true
  /// if a record was actually deleted.
  Future<bool> delete(int id);

  /// Returns SOS history entries whose latitude or longitude, as text,
  /// contains [query]. This table has no free-text field in its current
  /// schema, so coordinate-substring matching is the closest meaningful
  /// search available — a real text field (e.g. a location label) would
  /// be a better search target if one is added later.
  Future<List<SosHistory>> search(String query);
}

/// Drift-backed implementation of [SOSRepository].
///
/// Talks only to [DatabaseService] to reach the shared database.
class DriftSOSRepository implements SOSRepository {
  DriftSOSRepository([DatabaseService? databaseService])
      : _databaseService = databaseService ?? DatabaseService.instance;

  final DatabaseService _databaseService;

  @override
  Future<SosHistory> create(SosHistory entry) async {
    final db = _databaseService.database;
    final id = await db.into(db.sosHistories).insert(
          SosHistoriesCompanion.insert(
            latitude: entry.latitude,
            longitude: entry.longitude,
            timestamp: Value(entry.timestamp),
            sent: Value(entry.sent),
          ),
        );
    return entry.copyWith(id: id);
  }

  @override
  Future<SosHistory> update(SosHistory entry) async {
    final db = _databaseService.database;
    await db.update(db.sosHistories).replace(entry);
    return entry;
  }

  @override
  Future<SosHistory?> findById(int id) {
    final db = _databaseService.database;
    return (db.select(db.sosHistories)..where((s) => s.id.equals(id)))
        .getSingleOrNull();
  }

  @override
  Future<List<SosHistory>> getAll() {
    final db = _databaseService.database;
    return db.select(db.sosHistories).get();
  }

  @override
  Future<bool> delete(int id) async {
    final db = _databaseService.database;
    final rowsDeleted = await (db.delete(db.sosHistories)
          ..where((s) => s.id.equals(id)))
        .go();
    return rowsDeleted > 0;
  }

  @override
  Future<List<SosHistory>> search(String query) async {
    final all = await getAll();
    return all
        .where((entry) =>
            entry.latitude.toString().contains(query) ||
            entry.longitude.toString().contains(query))
        .toList();
  }
}
