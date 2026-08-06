import 'package:drift/drift.dart';

/// The `sos_histories` table — an append-only local log of SOS triggers.
///
/// This schema is deliberately simpler than the earlier Isar-era version
/// (no owning user, no recipient snapshot, no delivery-status enum) —
/// just enough to record that an SOS happened, where, and whether it was
/// sent.
@DataClassName('SosHistory')
class SosHistories extends Table {
  /// Local auto-incrementing primary key.
  IntColumn get id => integer().autoIncrement()();

  /// Latitude at the moment SOS was triggered.
  RealColumn get latitude => real()();

  /// Longitude at the moment SOS was triggered.
  RealColumn get longitude => real()();

  /// When SOS was triggered.
  DateTimeColumn get timestamp =>
      dateTime().withDefault(currentDateAndTime)();

  /// Whether the SOS message was actually sent.
  BoolColumn get sent => boolean().withDefault(const Constant(false))();
}
