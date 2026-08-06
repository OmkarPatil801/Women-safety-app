import 'package:drift/drift.dart';

/// The `contacts` table — a saved emergency contact.
///
/// This schema has no owning-user column (unlike the earlier Isar-era
/// design). Contacts are simply device-local, which still preserves the
/// app's existing "SOS works without login" behavior — if anything more
/// directly, since contacts are now never gated by an account at all.
@DataClassName('Contact')
class Contacts extends Table {
  /// Local auto-incrementing primary key.
  IntColumn get id => integer().autoIncrement()();

  /// The contact's display name.
  TextColumn get name => text()();

  /// The phone number `sendSOS()` will eventually text.
  TextColumn get phone => text()();

  /// Optional label such as "Mother" or "Friend".
  TextColumn get relationship => text().nullable()();

  /// Whether this contact is a Primary Emergency Contact. `sendSOS()`
  /// sends only to contacts where this is true — there is no limit on
  /// how many contacts can be marked primary. Added in schema version 2
  /// (see `AppDatabase.migration`); existing contacts default to false.
  BoolColumn get isPrimary =>
      boolean().withDefault(const Constant(false))();
}
