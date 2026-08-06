import 'package:drift/drift.dart';

import '../models/contact.dart';
import '../models/pending_sync.dart';
import '../models/report.dart';
import '../models/settings.dart';
import '../models/sos_history.dart';
import '../models/user.dart';

part 'app_database.g.dart';

/// The generated Drift database — the only file in the project that
/// knows all 6 tables exist together. [DatabaseService] owns the single
/// instance of this class; nothing outside `lib/database/` and
/// `lib/repositories/` should ever import this file.
///
/// Adding a new table later means adding it to the `tables` list below —
/// this is the single place that changes, repositories never need to
/// know.
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
            // Adds Contact.isPrimary (Primary Emergency Contacts). The
            // column's default (false) is applied to every existing row
            // automatically — no separate backfill needed. The old
            // `is_favorite` column this replaces is left in place on
            // already-migrated databases; it's simply no longer part of
            // the Dart schema, so nothing reads or writes it anymore.
            await migrator.addColumn(contacts, contacts.isPrimary);
          }
        },
      );
}
