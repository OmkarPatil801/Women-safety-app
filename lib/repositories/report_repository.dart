import 'package:drift/drift.dart';

import '../database/app_database.dart';
import '../database/database.dart';

/// Re-exports the generated [Report] data class so callers only ever
/// need to import this repository file — never `app_database.dart` or
/// Drift itself — to work with reports.
export '../database/app_database.dart' show Report;

/// Abstraction over persistence for [Report] records.
///
/// Callers must depend on this interface, never on [DatabaseService] or
/// Drift types directly. The Report feature itself is currently
/// postponed (a teammate owns the Report UI) — this repository exists so
/// that UI has a real, working persistence layer to call into whenever
/// it's ready, without needing any change here.
abstract class ReportRepository {
  /// Persists a new [Report]. Returns the same data with its assigned
  /// id.
  Future<Report> create(Report report);

  /// Looks up a report by its local id. Returns null if not found.
  Future<Report?> findById(int id);

  /// Returns every locally stored report.
  Future<List<Report>> getAll();

  /// Returns reports that have not yet been synced to Firebase.
  Future<List<Report>> getUnsynced();

  /// Persists changes to an existing [Report]. Returns the same instance
  /// once written.
  Future<Report> update(Report report);

  /// Deletes the report with the given local id. Returns true if a
  /// record was actually deleted.
  Future<bool> delete(int id);

  /// Returns reports whose category, severity, or description contains
  /// [query] (case-insensitive).
  Future<List<Report>> search(String query);
}

/// Drift-backed implementation of [ReportRepository].
///
/// Talks only to [DatabaseService] to reach the shared database.
class DriftReportRepository implements ReportRepository {
  DriftReportRepository([DatabaseService? databaseService])
      : _databaseService = databaseService ?? DatabaseService.instance;

  final DatabaseService _databaseService;

  @override
  Future<Report> create(Report report) async {
    final db = _databaseService.database;
    final id = await db.into(db.reports).insert(
          ReportsCompanion.insert(
            latitude: report.latitude,
            longitude: report.longitude,
            category: report.category,
            severity: report.severity,
            description: Value(report.description),
            imagePath: Value(report.imagePath),
            synced: Value(report.synced),
            timestamp: Value(report.timestamp),
          ),
        );
    return report.copyWith(id: id);
  }

  @override
  Future<Report> update(Report report) async {
    final db = _databaseService.database;
    await db.update(db.reports).replace(report);
    return report;
  }

  @override
  Future<Report?> findById(int id) {
    final db = _databaseService.database;
    return (db.select(db.reports)..where((r) => r.id.equals(id)))
        .getSingleOrNull();
  }

  @override
  Future<List<Report>> getAll() {
    final db = _databaseService.database;
    return db.select(db.reports).get();
  }

  @override
  Future<List<Report>> getUnsynced() {
    final db = _databaseService.database;
    return (db.select(db.reports)..where((r) => r.synced.equals(false)))
        .get();
  }

  @override
  Future<bool> delete(int id) async {
    final db = _databaseService.database;
    final rowsDeleted =
        await (db.delete(db.reports)..where((r) => r.id.equals(id))).go();
    return rowsDeleted > 0;
  }

  @override
  Future<List<Report>> search(String query) {
    final db = _databaseService.database;
    final likeQuery = '%$query%';
    return (db.select(db.reports)
          ..where((r) =>
              r.category.like(likeQuery) |
              r.severity.like(likeQuery) |
              r.description.like(likeQuery)))
        .get();
  }
}
