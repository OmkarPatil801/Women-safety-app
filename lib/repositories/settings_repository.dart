import 'package:drift/drift.dart';

import '../database/app_database.dart';
import '../database/database.dart';

/// Re-exports the generated [Settings] data class so callers only ever
/// need to import this repository file — never `app_database.dart` or
/// Drift itself — to work with settings.
export '../database/app_database.dart' show Settings;

/// Abstraction over persistence for [Settings] records.
///
/// Callers must depend on this interface, never on [DatabaseService] or
/// Drift types directly.
abstract class SettingsRepository {
  /// Persists a new [Settings] row. Returns the same data with its
  /// assigned id.
  Future<Settings> create(Settings settings);

  /// Looks up a settings row by its local id. Returns null if not found.
  Future<Settings?> findById(int id);

  /// Returns every locally stored settings row.
  Future<List<Settings>> getAll();

  /// Persists changes to an existing [Settings] row. Returns the same
  /// instance once written.
  Future<Settings> update(Settings settings);

  /// Deletes the settings row with the given local id. Returns true if a
  /// record was actually deleted.
  Future<bool> delete(int id);

  /// Returns settings rows whose language contains [query]
  /// (case-insensitive). [Settings.darkMode]/[Settings.notifications] are
  /// booleans and have no meaningful free-text match, so `language` is
  /// the only field this can search.
  Future<List<Settings>> search(String query);
}

/// Drift-backed implementation of [SettingsRepository].
///
/// Talks only to [DatabaseService] to reach the shared database.
class DriftSettingsRepository implements SettingsRepository {
  DriftSettingsRepository([DatabaseService? databaseService])
      : _databaseService = databaseService ?? DatabaseService.instance;

  final DatabaseService _databaseService;

  @override
  Future<Settings> create(Settings settings) async {
    final db = _databaseService.database;
    final id = await db.into(db.settingsTable).insert(
          SettingsTableCompanion.insert(
            darkMode: Value(settings.darkMode),
            notifications: Value(settings.notifications),
            language: Value(settings.language),
          ),
        );
    return settings.copyWith(id: id);
  }

  @override
  Future<Settings> update(Settings settings) async {
    final db = _databaseService.database;
    await db.update(db.settingsTable).replace(settings);
    return settings;
  }

  @override
  Future<Settings?> findById(int id) {
    final db = _databaseService.database;
    return (db.select(db.settingsTable)..where((s) => s.id.equals(id)))
        .getSingleOrNull();
  }

  @override
  Future<List<Settings>> getAll() {
    final db = _databaseService.database;
    return db.select(db.settingsTable).get();
  }

  @override
  Future<bool> delete(int id) async {
    final db = _databaseService.database;
    final rowsDeleted = await (db.delete(db.settingsTable)
          ..where((s) => s.id.equals(id)))
        .go();
    return rowsDeleted > 0;
  }

  @override
  Future<List<Settings>> search(String query) {
    final db = _databaseService.database;
    final likeQuery = '%$query%';
    return (db.select(db.settingsTable)
          ..where((s) => s.language.like(likeQuery)))
        .get();
  }
}
