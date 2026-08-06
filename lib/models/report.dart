import 'package:drift/drift.dart';

/// The `reports` table — a community-submitted unsafe-area incident
/// report. Feature is currently postponed (a teammate owns the Report
/// UI); this table exists so [ReportRepository] has a real schema to
/// eventually persist to, without blocking on that UI work.
@DataClassName('Report')
class Reports extends Table {
  /// Local auto-incrementing primary key.
  IntColumn get id => integer().autoIncrement()();

  /// Latitude of the reported location.
  RealColumn get latitude => real()();

  /// Longitude of the reported location.
  RealColumn get longitude => real()();

  /// Optional free-text detail about the incident.
  TextColumn get description => text().nullable()();

  /// The incident category (e.g. "harassment", "poor lighting"). Kept as
  /// plain text rather than an enum — the category taxonomy isn't
  /// finalized anywhere in the project yet.
  TextColumn get category => text()();

  /// The incident severity. Kept as plain text for the same reason as
  /// [category] — no fixed taxonomy has been decided yet.
  TextColumn get severity => text()();

  /// Path to an attached photo, if any. Nullable — not every report has
  /// one.
  TextColumn get imagePath => text().nullable()();

  /// Whether this report has been pushed to Firebase yet.
  BoolColumn get synced => boolean().withDefault(const Constant(false))();

  /// When this report was submitted.
  DateTimeColumn get timestamp =>
      dateTime().withDefault(currentDateAndTime)();
}
