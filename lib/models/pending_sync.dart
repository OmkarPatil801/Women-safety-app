import 'package:drift/drift.dart';

/// Which local table a [PendingSync] entry refers to.
enum SyncEntityType {
  /// Refers to a [Users] row.
  user,

  /// Refers to a [Contacts] row.
  contact,

  /// Refers to a [Reports] row.
  report,

  /// Refers to a [SosHistories] row.
  sosHistory,

  /// Refers to a [SettingsTable] row.
  settings,
}

/// What kind of change a [PendingSync] entry represents.
enum SyncAction {
  /// The record was created locally and needs to be created in Firebase.
  create,

  /// The record was edited locally and needs to be updated in Firebase.
  update,

  /// The record was deleted locally and needs to be deleted in Firebase.
  delete,
}

/// The `pending_syncs` table — a generic local sync queue.
///
/// Rather than every table tracking its own bespoke sync queue, this one
/// shared table tracks any locally-changed record that still needs to
/// reach Firestore. It exists separately from a per-row `synced` flag
/// because a flag on the record itself cannot represent a deletion —
/// once a row is deleted locally, there is nothing left to flag.
class PendingSyncs extends Table {
  /// Local auto-incrementing primary key.
  IntColumn get id => integer().autoIncrement()();

  /// Which table the affected record belongs to.
  TextColumn get entityType => textEnum<SyncEntityType>()();

  /// The local id of the affected record within its own table.
  IntColumn get entityId => integer()();

  /// Whether the affected record was created, updated, or deleted.
  TextColumn get action => textEnum<SyncAction>()();

  /// When this change was queued.
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();

  /// Whether this change has been successfully pushed to Firebase yet.
  BoolColumn get synced => boolean().withDefault(const Constant(false))();
}
