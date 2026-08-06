import 'package:drift/drift.dart';

/// The `users` table — a locally persisted user record.
///
/// Field set intentionally matches exactly what was specified for the
/// Drift migration (id, name, phone, email, createdAt). Earlier
/// Isar-era fields such as a password hash or a Firebase UID are not
/// part of this schema — re-add them here if/when real authentication
/// work resumes.
@DataClassName('User')
class Users extends Table {
  /// Local auto-incrementing primary key.
  IntColumn get id => integer().autoIncrement()();

  /// The user's display name.
  TextColumn get name => text()();

  /// The user's phone number.
  TextColumn get phone => text()();

  /// The user's email address. Nullable — nothing in the app currently
  /// collects an email (login only uses phone), so requiring one here
  /// would make every current code path that creates a [User] invalid.
  TextColumn get email => text().nullable()();

  /// When this local record was created.
  DateTimeColumn get createdAt =>
      dateTime().withDefault(currentDateAndTime)();
}
