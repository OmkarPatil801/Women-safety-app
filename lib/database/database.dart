import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'app_database.dart';

/// Owns the lifecycle of the local Drift database instance for the whole
/// app.
///
/// Only one [AppDatabase] should ever be open at a time, so every
/// repository shares this single handle rather than each opening its
/// own — that's what the singleton pattern below enforces.
///
/// This is the only class outside `lib/database/` that repositories are
/// allowed to depend on for persistence. Nothing above the repository
/// layer (screens, providers) should ever import Drift or this file
/// directly.
class DatabaseService {
  DatabaseService._internal();

  static final DatabaseService instance = DatabaseService._internal();

  AppDatabase? _database;

  /// The active database. Throws if accessed before [openDatabase] has
  /// completed — callers must always await startup first.
  AppDatabase get database {
    final currentDatabase = _database;
    if (currentDatabase == null) {
      throw StateError(
        'DatabaseService.database was accessed before openDatabase() '
        'completed. Call DatabaseService.instance.openDatabase() during '
        'app startup.',
      );
    }
    return currentDatabase;
  }

  bool get isOpen => _database != null;

  /// Opens the local database. Safe to call once during app startup;
  /// calling it again while already open is a no-op.
  ///
  /// The underlying [NativeDatabase] connection is opened lazily on
  /// first query (see [_openConnection]), so this method itself
  /// completes immediately without blocking app startup on disk I/O.
  Future<void> openDatabase() async {
    if (_database != null) return;
    _database = AppDatabase(_openConnection());
  }

  /// Closes the local database. Exposed for app shutdown hooks and tests
  /// that need a clean instance between runs.
  Future<void> close() async {
    final currentDatabase = _database;
    if (currentDatabase == null) return;

    await currentDatabase.close();
    _database = null;
  }

  /// Resolves the on-disk SQLite file location and opens it. Deferred
  /// via [LazyDatabase] so constructing [AppDatabase] never has to be
  /// awaited itself — Drift awaits this the first time a query runs.
  LazyDatabase _openConnection() {
    return LazyDatabase(() async {
      final directory = await getApplicationDocumentsDirectory();
      final file = File(p.join(directory.path, 'women_safety_app.sqlite'));
      return NativeDatabase.createInBackground(file);
    });
  }

  // ─── Future Firebase sync note ──────────────────────────────────────────
  // This service deliberately knows nothing about Firebase — its only
  // responsibility is the local Drift database's lifecycle. A future sync
  // layer (e.g. a FirebaseSyncService) will read pending/unsynced records
  // through DatabaseService.instance.database (via PendingSyncRepository
  // and each entity repository) and push them to Firestore, without this
  // file needing to change.
}
